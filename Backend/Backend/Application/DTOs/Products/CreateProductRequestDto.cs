using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTOs.Products;

public class CreateProductRequestDto
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(64)]
    public string? Sku { get; set; }

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    [Required]
    public Guid CategoryId { get; set; }
}