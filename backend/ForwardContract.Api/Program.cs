using ForwardContract.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Register domain services
builder.Services.AddScoped<IForwardCalculationService, ForwardCalculationService>();

// Add controller support
builder.Services.AddControllers();

// Configure CORS for local React development server (ports 5173, 5174, 3000 on localhost and 127.0.0.1)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
                "http://localhost:3000",
                "http://127.0.0.1:3000")
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                try
                {
                    var uri = new Uri(origin);
                    return (uri.Host == "localhost" || uri.Host == "127.0.0.1") &&
                           (uri.Port == 5173 || uri.Port == 5174 || uri.Port == 3000);
                }
                catch
                {
                    return false;
                }
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// Direct health-check endpoint (/health) with CORS
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow,
    service = "ForwardContract.Api",
    framework = "net6.0",
    version = "1.0.0"
})).RequireCors("AllowFrontend");

app.Run();
