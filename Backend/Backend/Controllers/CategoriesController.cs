using Backend.Application.DTOs.Categories;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetAll()
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new CategoryResponseDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponseDto>> Create([FromBody] CreateCategoryRequestDto request)
    {
        var normalizedName = request.Name.Trim();

        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return BadRequest("Nome da categoria e obrigatorio.");
        }

        var nameExists = await _context.Categories
            .AnyAsync(x => x.Name.ToLower() == normalizedName.ToLower());

        if (nameExists)
        {
            return Conflict("Nome da categoria ja existe.");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
            Description = string.Empty
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var response = new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description
        };

        return CreatedAtAction(nameof(GetAll), response);
    }
}