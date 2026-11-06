using Microsoft.AspNetCore.Mvc;

namespace ForwardContract.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            service = "ForwardContract.Api",
            framework = "net6.0",
            version = "1.0.0"
        });
    }
}
