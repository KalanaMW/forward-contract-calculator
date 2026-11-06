using System;
using ForwardContract.Api.Models;
using ForwardContract.Api.Services;
using Xunit;

namespace ForwardContract.Tests;

public class ForwardCalculationServiceTests
{
    private readonly IForwardCalculationService _service;

    public ForwardCalculationServiceTests()
    {
        _service = new ForwardCalculationService();
    }

    [Fact]
    public void CalculatePayoff_WhenMarketPriceExceedsAgreedPrice_BuyerMakesProfitAndSellerMakesLoss()
    {
        // Arrange: S = 240, K = 210, Q = 100
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = 210m,
            MarketPrice = 240m,
            Quantity = 100m
        };

        // Act
        var response = _service.CalculatePayoff(request);

        // Assert: Buyer Payoff = (240 - 210) * 100 = 3000; Seller Payoff = (210 - 240) * 100 = -3000
        Assert.Equal(3000m, response.BuyerPayoff);
        Assert.Equal(-3000m, response.SellerPayoff);
        Assert.True(response.BuyerPayoff > 0, "Buyer should make a profit.");
        Assert.True(response.SellerPayoff < 0, "Seller should make a loss.");
    }

    [Fact]
    public void CalculatePayoff_WhenMarketPriceBelowAgreedPrice_BuyerMakesLossAndSellerMakesProfit()
    {
        // Arrange: S = 180, K = 210, Q = 100
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = 210m,
            MarketPrice = 180m,
            Quantity = 100m
        };

        // Act
        var response = _service.CalculatePayoff(request);

        // Assert: Buyer Payoff = (180 - 210) * 100 = -3000; Seller Payoff = (210 - 180) * 100 = +3000
        Assert.Equal(-3000m, response.BuyerPayoff);
        Assert.Equal(3000m, response.SellerPayoff);
        Assert.True(response.BuyerPayoff < 0, "Buyer should make a loss.");
        Assert.True(response.SellerPayoff > 0, "Seller should make a profit.");
    }

    [Fact]
    public void CalculatePayoff_WhenMarketPriceEqualsAgreedPrice_BreakEvenOutcome()
    {
        // Arrange: S = 210, K = 210, Q = 100
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = 210m,
            MarketPrice = 210m,
            Quantity = 100m
        };

        // Act
        var response = _service.CalculatePayoff(request);

        // Assert: Both payoffs must be 0
        Assert.Equal(0m, response.BuyerPayoff);
        Assert.Equal(0m, response.SellerPayoff);
    }

    [Fact]
    public void CalculatePayoff_WithDecimalPricesAndQuantities_CalculatesPrecisely()
    {
        // Arrange: S = 240.75, K = 210.50, Q = 10.5
        // (240.75 - 210.50) = 30.25; 30.25 * 10.5 = 317.625
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = 210.50m,
            MarketPrice = 240.75m,
            Quantity = 10.5m
        };

        // Act
        var response = _service.CalculatePayoff(request);

        // Assert
        Assert.Equal(317.625m, response.BuyerPayoff);
        Assert.Equal(-317.625m, response.SellerPayoff);
    }

    [Theory]
    [InlineData(-1, 240, 100, "Agreed forward price (K) cannot be negative.")]
    [InlineData(210, -1, 100, "Market price at maturity (S) cannot be negative.")]
    [InlineData(210, 240, 0, "Contract quantity (Q) must be greater than zero.")]
    [InlineData(210, 240, -10, "Contract quantity (Q) must be greater than zero.")]
    public void CalculatePayoff_WithInvalidInputs_ThrowsArgumentException(decimal k, decimal s, decimal q, string expectedErrorSubstring)
    {
        // Arrange
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = k,
            MarketPrice = s,
            Quantity = q
        };

        // Act & Assert
        var ex = Assert.Throws<ArgumentException>(() => _service.CalculatePayoff(request));
        Assert.Contains(expectedErrorSubstring, ex.Message);
    }

    [Fact]
    public void CalculatePayoff_WhenRequestNull_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() => _service.CalculatePayoff((ForwardCalculationRequest)null!));
    }

    [Fact]
    public void CalculatePayoff_WhenFieldsMissing_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => _service.CalculatePayoff(new ForwardCalculationRequest
        {
            AgreedPrice = null,
            MarketPrice = 240m,
            Quantity = 100m
        }));

        Assert.Throws<ArgumentException>(() => _service.CalculatePayoff(new ForwardCalculationRequest
        {
            AgreedPrice = 210m,
            MarketPrice = null,
            Quantity = 100m
        }));

        Assert.Throws<ArgumentException>(() => _service.CalculatePayoff(new ForwardCalculationRequest
        {
            AgreedPrice = 210m,
            MarketPrice = 240m,
            Quantity = null
        }));
    }

    [Fact]
    public void CalculatePayoff_WhenArithmeticOverflowOccurs_ThrowsArgumentExceptionWithHelpfulMessage()
    {
        // Arrange: huge numbers that cause decimal multiplication overflow
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = 0m,
            MarketPrice = decimal.MaxValue,
            Quantity = 2m
        };

        // Act & Assert
        var ex = Assert.Throws<ArgumentException>(() => _service.CalculatePayoff(request));
        Assert.Contains("arithmetic overflow", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(210, 240, 100)]
    [InlineData(210, 180, 100)]
    [InlineData(210, 210, 100)]
    [InlineData(150.25, 175.80, 50.5)]
    [InlineData(500, 320, 1000)]
    [InlineData(0, 100, 50)]
    public void CalculatePayoff_ZeroSumProperty_BuyerPayoffPlusSellerPayoffAlwaysEqualsZero(decimal k, decimal s, decimal q)
    {
        // Arrange
        var request = new ForwardCalculationRequest
        {
            AgreedPrice = k,
            MarketPrice = s,
            Quantity = q
        };

        // Act
        var response = _service.CalculatePayoff(request);

        // Assert: Zero-sum bilateral derivative property: Buyer Payoff + Seller Payoff = 0
        Assert.Equal(0m, response.BuyerPayoff + response.SellerPayoff);
    }
}
