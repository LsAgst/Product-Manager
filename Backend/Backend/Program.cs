using Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("Validation");

            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .Select(x => new
                {
                    Field = x.Key,
                    Messages = x.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                })
                .ToArray();

            logger.LogWarning(
                "Validation error on {Method} {Path}. Errors: {@Errors}",
                context.HttpContext.Request.Method,
                context.HttpContext.Request.Path,
                errors);

            var validationProblem = new ValidationProblemDetails(context.ModelState)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Falha de validacao",
                Detail = "Um ou mais erros de validacao ocorreram.",
                Type = "https://httpstatuses.com/400"
            };

            validationProblem.Extensions["code"] = "VALIDATION_ERROR";

            return new BadRequestObjectResult(validationProblem);
        };
    });
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    await AppDbSeeder.SeedAsync(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandlerFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var exception = exceptionHandlerFeature?.Error;

        var logger = context.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("Exceptions");

        if (exception is not null)
        {
            logger.LogError(
                exception,
                "Unhandled exception on {Method} {Path}",
                context.Request.Method,
                context.Request.Path);
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Erro interno do servidor",
            Detail = "Ocorreu um erro inesperado.",
            Type = "https://httpstatuses.com/500"
        };

        problem.Extensions["code"] = "UNHANDLED_EXCEPTION";

        await context.Response.WriteAsJsonAsync(problem);
    });
});

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
