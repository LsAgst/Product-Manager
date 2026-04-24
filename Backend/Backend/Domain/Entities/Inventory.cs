namespace Backend.Domain.Entities;

public class Inventory
{
    public Guid ProductId { get; set; }
    public int QuantityOnHand { get; set; }
    public DateTime LastUpdated { get; set; }
    public Product? Product { get; set; }
}