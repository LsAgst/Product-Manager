using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Inventory> Inventories => Set<Inventory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Sku).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(1000);
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.HasIndex(x => x.Sku).IsUnique();
            entity.HasQueryFilter(x => !x.IsDeleted);

            entity.HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Inventory)
                .WithOne(x => x.Product)
                .HasForeignKey<Inventory>(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(x => x.ProductId);
            entity.Property(x => x.QuantityOnHand).IsRequired();
            entity.HasQueryFilter(x => x.Product != null && !x.Product.IsDeleted);
        });
    }
}