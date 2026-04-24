using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Data;

public static class AppDbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (await context.Categories.AnyAsync())
        {
            return;
        }

        var electronics = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Eletronicos",
            Description = "Dispositivos e acessorios eletronicos"
        };

        var books = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Livros",
            Description = "Livros fisicos e digitais"
        };

        context.Categories.AddRange(electronics, books);

        var now = DateTime.UtcNow;

        var products = new List<Product>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Mechanical Keyboard",
                Sku = "ELEC-MECH-KEYBOARD-001",
                Description = "RGB mechanical keyboard",
                Price = 399.90m,
                Stock = 25,
                CategoryId = electronics.Id,
                CreatedAt = now,
                UpdatedAt = now,
                IsDeleted = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Clean Code",
                Sku = "BOOK-CLEAN-CODE-001",
                Description = "A Handbook of Agile Software Craftsmanship",
                Price = 129.90m,
                Stock = 40,
                CategoryId = books.Id,
                CreatedAt = now,
                UpdatedAt = now,
                IsDeleted = false
            }
        };

        context.Products.AddRange(products);

        context.Inventories.AddRange(products.Select(p => new Inventory
        {
            ProductId = p.Id,
            QuantityOnHand = p.Stock,
            LastUpdated = now
        }));

        await context.SaveChangesAsync();
    }
}