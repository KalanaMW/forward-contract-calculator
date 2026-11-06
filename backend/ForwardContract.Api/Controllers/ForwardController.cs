using ForwardContract.Api.Models;
using ForwardContract.Api.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace ForwardContract.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("AllowFrontend")]
public class ForwardController : ControllerBase
{
    private readonly IForwardCalculationService _calculationService;
    private readonly ILogger<ForwardController> _logger;

    public ForwardController(IForwardCalculationService calculationService, ILogger<ForwardController> logger)
    {
        _calculationService = calculationService;
        _logger = logger;
    }

    /// <summary>
    /// Calculates buyer and seller payoffs for a forward contract upon maturity.
    /// POST /api/forward/calculate
    /// </summary>
    /// <param name="request">Contract parameters: agreedPrice (K), marketPrice (S), quantity (Q)</param>
    /// <returns>ForwardCalculationResponse with buyerPayoff and sellerPayoff</returns>
    [HttpPost("calculate")]
    [ProducesResponseType(typeof(ForwardCalculationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult Calculate([FromBody] ForwardCalculationRequest? request)
    {
        if (request == null)
        {
            return BadRequest(new { error = "Request body cannot be empty or malformed." });
        }

        // Check data annotation validations
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Additional domain validation
        if (request.Quantity <= 0)
        {
            return BadRequest(new
            {
                error = "Validation failed.",
                details = new[] { "Contract quantity (Q) must be greater than zero." }
            });
        }

        try
        {
            var response = _calculationService.CalculatePayoff(request);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Invalid forward contract calculation parameters: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error calculating forward contract payoff.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                error = "An error occurred while processing the calculation. Please try again."
            });
        }
    }
}
