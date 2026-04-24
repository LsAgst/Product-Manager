using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Sku = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Stock = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Inventories",
                columns: table => new
                {
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityOnHand = table.Column<int>(type: "integer", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventories", x => x.ProductId);
                    table.ForeignKey(
                        name: "FK_Inventories_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Sku",
                table: "Products",
                column: "Sku",
                unique: true);

            migrationBuilder.Sql(
                """
                INSERT INTO "Categories" ("Id", "Name", "Description")
                VALUES
                    ('3da8afc5-694f-4cb9-b6b8-c74c13c5fb01', 'Casa', ''),
                    ('f1f2ba99-8f7f-4e6e-83b6-c01f3a3d5202', 'Esportes', ''),
                    ('0d77a2b9-6e45-4a3f-ae95-a2e605dbde03', 'Brinquedos', ''),
                    ('8ce45a64-68cb-4d1a-8b32-b6d5f12f1104', 'Alimentos', ''),
                    ('5bc4fd20-c74f-4d1f-87db-cb8db4cb1d05', 'Escritorio', ''),
                    ('cd3d2db6-10d6-46dc-a290-c2dcf9a9b506', 'Saude', ''),
                    ('7e94aa53-d8fe-4d42-b123-bd7ad0afde07', 'Moda', ''),
                    ('af4aa032-5241-47b3-a5fc-bf564302de08', 'Automotivo', ''),
                    ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Eletronicos', ''),
                    ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Livros', '');
                """);

            migrationBuilder.Sql(
                """
                WITH generated AS (
                    SELECT
                        g.n,
                        md5('pm-seed-product-' || g.n::text) AS hash,
                        ('Produto de Teste ' || LPAD(g.n::text, 3, '0')) AS name,
                        ('SKU-TST-' || LPAD(g.n::text, 5, '0')) AS sku,
                        'Item gerado via migration para testes de listagem, filtros e paginacao.' AS description,
                        ROUND((19.90 + ((g.n % 180) * 2.35))::numeric, 2) AS price,
                        (5 + (g.n % 95))::integer AS stock,
                        CASE g.n % 10
                            WHEN 0 THEN '3da8afc5-694f-4cb9-b6b8-c74c13c5fb01'::uuid
                            WHEN 1 THEN 'f1f2ba99-8f7f-4e6e-83b6-c01f3a3d5202'::uuid
                            WHEN 2 THEN '0d77a2b9-6e45-4a3f-ae95-a2e605dbde03'::uuid
                            WHEN 3 THEN '8ce45a64-68cb-4d1a-8b32-b6d5f12f1104'::uuid
                            WHEN 4 THEN '5bc4fd20-c74f-4d1f-87db-cb8db4cb1d05'::uuid
                            WHEN 5 THEN 'cd3d2db6-10d6-46dc-a290-c2dcf9a9b506'::uuid
                            WHEN 6 THEN '7e94aa53-d8fe-4d42-b123-bd7ad0afde07'::uuid
                            WHEN 7 THEN 'af4aa032-5241-47b3-a5fc-bf564302de08'::uuid
                            WHEN 8 THEN 'a1b2c3d4-e5f6-7890-abcd-ef1234567801'::uuid
                            ELSE 'a1b2c3d4-e5f6-7890-abcd-ef1234567802'::uuid
                        END AS category_id
                    FROM generate_series(1, 160) AS g(n)
                ),
                seed_products AS (
                    SELECT
                        (
                            SUBSTRING(hash, 1, 8) || '-' ||
                            SUBSTRING(hash, 9, 4) || '-' ||
                            SUBSTRING(hash, 13, 4) || '-' ||
                            SUBSTRING(hash, 17, 4) || '-' ||
                            SUBSTRING(hash, 21, 12)
                        )::uuid AS id,
                        name,
                        sku,
                        description,
                        price,
                        stock,
                        category_id
                    FROM generated
                )
                INSERT INTO "Products" (
                    "Id", "Name", "Sku", "Description", "Price", "Stock",
                    "CategoryId", "CreatedAt", "UpdatedAt", "IsDeleted", "DeletedAt"
                )
                SELECT
                    id, name, sku, description, price, stock,
                    category_id, NOW(), NOW(), FALSE, NULL
                FROM seed_products;
                """);

            migrationBuilder.Sql(
                """
                INSERT INTO "Inventories" ("ProductId", "QuantityOnHand", "LastUpdated")
                SELECT p."Id", p."Stock", NOW()
                FROM "Products" p
                WHERE p."Sku" LIKE 'SKU-TST-%';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Inventories");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
