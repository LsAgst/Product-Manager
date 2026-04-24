using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTOs.Categories;

public class CreateCategoryRequestDto
{
    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;
}
