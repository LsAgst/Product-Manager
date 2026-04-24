using Backend.Application.DTOs.Products;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.RegularExpressions;

namespace Backend.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(AppDbContext context, ILogger<ProductsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] Guid? categoryId = null)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.Description.Contains(search));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == categoryId.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ProductResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                Sku = x.Sku,
                Description = x.Description,
                Price = x.Price,
                Stock = x.Stock,
                CategoryId = x.CategoryId,
                CategoryName = x.Category != null ? x.Category.Name : string.Empty,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalCount,
            items
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductResponseDto>> GetById(Guid id)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
        {
            return ProblemResponse(
                StatusCodes.Status404NotFound,
                "Produto nao encontrado",
                $"Produto com id '{id}' nao foi encontrado.",
                "PRODUCT_NOT_FOUND");
        }

        return Ok(MapToResponse(product));
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponseDto>> Create([FromBody] CreateProductRequestDto request)
    {
        var manualSku = TryNormalizeManualSku(request.Sku);
        string normalizedSku;

        if (manualSku is not null)
        {
            var skuExists = await _context.Products
                .IgnoreQueryFilters()
                .AnyAsync(x => x.Sku == manualSku);

            if (skuExists)
            {
                _logger.LogWarning("Product creation rejected: duplicated SKU {Sku}.", manualSku);
                return ProblemResponse(
                    StatusCodes.Status409Conflict,
                    "SKU duplicado",
                    "SKU ja existe.",
                    "SKU_DUPLICATED");
            }

            normalizedSku = manualSku;
        }
        else
        {
            normalizedSku = await GenerateSkuAsync(request.Name);
        }

        var category = await _context.Categories
            .AsNoTracking()
            .Where(x => x.Id == request.CategoryId)
            .Select(x => new { x.Id, x.Name })
            .FirstOrDefaultAsync();

        if (category is null)
        {
            _logger.LogWarning("Product creation rejected: category {CategoryId} not found.", request.CategoryId);
            return ProblemResponse(
                StatusCodes.Status400BadRequest,
                "Categoria nao encontrada",
                "Categoria nao encontrada.",
                "CATEGORY_NOT_FOUND");
        }

        if (IsElectronicsCategory(category.Name) && request.Price < 50m)
        {
            _logger.LogWarning(
                "Product creation rejected: electronics category with price below minimum. SKU {Sku}, Price {Price}.",
                normalizedSku,
                request.Price);
            return ProblemResponse(
                StatusCodes.Status400BadRequest,
                "Preco invalido para eletronicos",
                "Para a categoria eletronicos, o preco unitario deve ser no minimo 50,00.",
                "ELECTRONICS_MIN_PRICE");
        }

        var now = DateTime.UtcNow;

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Sku = normalizedSku,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            CategoryId = request.CategoryId,
            CreatedAt = now,
            UpdatedAt = now,
            IsDeleted = false
        };

        var inventory = new Inventory
        {
            ProductId = product.Id,
            QuantityOnHand = request.Stock,
            LastUpdated = now
        };

        _context.Products.Add(product);
        _context.Inventories.Add(inventory);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Product created. ProductId {ProductId}, SKU {Sku}, CategoryId {CategoryId}.",
            product.Id,
            product.Sku,
            product.CategoryId);

        product = await _context.Products
            .AsNoTracking()
            .Include(x => x.Category)
            .FirstAsync(x => x.Id == product.Id);

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapToResponse(product));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequestDto request)
    {
        var manualSku = TryNormalizeManualSku(request.Sku);

        var product = await _context.Products
            .Include(x => x.Inventory)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
        {
            _logger.LogWarning("Product update rejected: product {ProductId} not found.", id);
            return ProblemResponse(
                StatusCodes.Status404NotFound,
                "Produto nao encontrado",
                $"Produto com id '{id}' nao foi encontrado.",
                "PRODUCT_NOT_FOUND");
        }

        var category = await _context.Categories
            .AsNoTracking()
            .Where(x => x.Id == request.CategoryId)
            .Select(x => new { x.Id, x.Name })
            .FirstOrDefaultAsync();

        if (category is null)
        {
            _logger.LogWarning(
                "Product update rejected: category {CategoryId} not found for product {ProductId}.",
                request.CategoryId,
                id);
            return ProblemResponse(
                StatusCodes.Status400BadRequest,
                "Categoria nao encontrada",
                "Categoria nao encontrada.",
                "CATEGORY_NOT_FOUND");
        }

        if (IsElectronicsCategory(category.Name) && request.Price < 50m)
        {
            _logger.LogWarning(
                "Product update rejected: electronics category with price below minimum. ProductId {ProductId}, SKU {Sku}, Price {Price}.",
                id,
                manualSku ?? "(auto)",
                request.Price);
            return ProblemResponse(
                StatusCodes.Status400BadRequest,
                "Preco invalido para eletronicos",
                "Para a categoria eletronicos, o preco unitario deve ser no minimo 50,00.",
                "ELECTRONICS_MIN_PRICE");
        }

        string normalizedSku;

        if (manualSku is not null)
        {
            var skuExists = await _context.Products
                .IgnoreQueryFilters()
                .AnyAsync(x => x.Id != id && x.Sku == manualSku);

            if (skuExists)
            {
                _logger.LogWarning(
                    "Product update rejected: duplicated SKU {Sku} for product {ProductId}.",
                    manualSku,
                    id);
                return ProblemResponse(
                    StatusCodes.Status409Conflict,
                    "SKU duplicado",
                    "SKU ja existe.",
                    "SKU_DUPLICATED");
            }

            normalizedSku = manualSku;
        }
        else
        {
            normalizedSku = await GenerateSkuAsync(request.Name, id);
        }

        product.Name = request.Name;
        product.Sku = normalizedSku;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.CategoryId = request.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        if (product.Inventory is null)
        {
            product.Inventory = new Inventory
            {
                ProductId = product.Id,
                QuantityOnHand = request.Stock,
                LastUpdated = DateTime.UtcNow
            };
        }
        else
        {
            product.Inventory.QuantityOnHand = request.Stock;
            product.Inventory.LastUpdated = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Product updated. ProductId {ProductId}, SKU {Sku}, CategoryId {CategoryId}.",
            product.Id,
            product.Sku,
            product.CategoryId);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _context.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (product is null)
        {
            _logger.LogWarning("Product deletion rejected: product {ProductId} not found.", id);
            return ProblemResponse(
                StatusCodes.Status404NotFound,
                "Produto nao encontrado",
                $"Produto com id '{id}' nao foi encontrado.",
                "PRODUCT_NOT_FOUND");
        }

        product.IsDeleted = true;
        product.DeletedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Product deleted (soft delete). ProductId {ProductId}, SKU {Sku}.", product.Id, product.Sku);

        return NoContent();
    }

    private static ProductResponseDto MapToResponse(Product product)
    {
        return new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Sku = product.Sku,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }

    private static bool IsElectronicsCategory(string categoryName)
    {
        return categoryName.Equals("Electronics", StringComparison.OrdinalIgnoreCase)
            || categoryName.Equals("Eletronicos", StringComparison.OrdinalIgnoreCase)
            || categoryName.Equals("Eletrônicos", StringComparison.OrdinalIgnoreCase);
    }

    private static string? TryNormalizeManualSku(string? sku)
    {
        if (string.IsNullOrWhiteSpace(sku))
        {
            return null;
        }

        var normalized = sku.Trim().ToUpperInvariant();
        return normalized.Length == 0 ? null : normalized;
    }

    private async Task<string> GenerateSkuAsync(string productName, Guid? ignoreProductId = null)
    {
        var basePrefix = BuildSkuPrefix(productName);

        var candidatesQuery = _context.Products
            .IgnoreQueryFilters()
            .Where(x => x.Sku.StartsWith(basePrefix + "-"));

        if (ignoreProductId.HasValue)
        {
            candidatesQuery = candidatesQuery.Where(x => x.Id != ignoreProductId.Value);
        }

        var existingSkus = await candidatesQuery
            .Select(x => x.Sku)
            .ToListAsync();

        var maxSequence = 0;
        foreach (var sku in existingSkus)
        {
            var parts = sku.Split('-', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length < 2)
            {
                continue;
            }

            var sequenceText = parts[^1];
            if (int.TryParse(sequenceText, out var parsed) && parsed > maxSequence)
            {
                maxSequence = parsed;
            }
        }

        var next = maxSequence + 1;
        return $"{basePrefix}-{next:D3}";
    }

    private static string BuildSkuPrefix(string productName)
    {
        var normalized = Regex.Replace(productName.ToUpperInvariant(), "[^A-Z0-9]", "");
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return "PROD";
        }

        var prefixLength = Math.Min(6, normalized.Length);
        var prefix = new StringBuilder(normalized.Substring(0, prefixLength));

        while (prefix.Length < 3)
        {
            prefix.Append('X');
        }

        return prefix.ToString();
    }

    private ObjectResult ProblemResponse(int status, string title, string detail, string code)
    {
        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Type = $"https://httpstatuses.com/{status}"
        };

        problem.Extensions["code"] = code;

        return StatusCode(status, problem);
    }
}