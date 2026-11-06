using ForwardContract.Api.Controllers;
using ForwardContract.Api.Models;
using ForwardContract.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace ForwardContract.Tests;

public class ForwardControllerTests
{
    private readonly ForwardController _controller;
    private readonly IForwardCalculationService _service;

    public ForwardControllerTests()
    {
        _service = new ForwardCalculationService();
        _controller = new ForwardController(_service, NullLogger<ForwardController>.Instance);
    }

    [Fact]
    public void Calculate_WithValidParameters_ReturnsOkObjectResultWithPayoffs()
    {
        // Arrange
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = 210m,
            MarketPrice = 240m,
            Quantity = 100m
        };

        // Act
        var result = _controller.Calculate(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ForwardCalculationResponse>(okResult.Value);
        Assert.Equal(3000m, response.BuyerPayoff);
        Assert.Equal(-3000m, response.SellerPayoff);
    }

    [Fact]
    public void Calculate_WhenRequestIsNull_ReturnsBadRequest()
    {
        // Act
        var result = _controller.Calculate(null);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void Calculate_WhenQuantityIsZeroOrNegative_ReturnsBadRequest()
    {
        // Arrange
        var requestZero = new ForwardCalculationRequest
        {
            AgreedPrice = 210m,
            MarketPrice = 240m,
            Quantity = 0m
        };

        var requestNegative = new ForwardCalculationRequest
        {
            AgreedPrice = 210m,
            MarketPrice = 240m,
            Quantity = -10m
        };

        // Act & Assert
        Assert.IsType<BadRequestObjectResult>(_controller.Calculate(requestZero));
        Assert.IsType<BadRequestObjectResult>(_controller.Calculate(requestNegative));
    }

    [Fact]
    public void Calculate_WhenAgreedPriceIsNegative_ReturnsBadRequest()
    {
        // Arrange
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = -50m,
            MarketPrice = 240m,
            Quantity = 100m
        };

        // Act
        var result = _controller.Calculate(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void Calculate_WhenArithmeticOverflowOccurs_ReturnsBadRequest()
    {
        // Arrange
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = 0m,
            MarketPrice = decimal.MaxValue,
            Quantity = 2m
        };

        // Act
        var result = _controller.Calculate(request);

        // Assert: Must return 400 Bad Request instead of 500
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
    }
}
