using ForwardContract.Api.Models;

namespace ForwardContract.Api.Services;

public class ForwardCalculationService : IForwardCalculationService
{
    public ForwardCalculationResponse CalculatePayoff(ForwardCalculationRequest request)
    {
        if (request == null)
        {
            throw new ArgumentNullException(nameof(request), "Calculation request cannot be null.");
        }

        if (!request.AgreedPrice.HasValue)
        {
            throw new ArgumentException("Agreed forward price (K) is required.", nameof(request.AgreedPrice));
        }

        if (!request.MarketPrice.HasValue)
        {
            throw new ArgumentException("Market price at maturity (S) is required.", nameof(request.MarketPrice));
        }

        if (!request.Quantity.HasValue)
        {
            throw new ArgumentException("Contract quantity (Q) is required.", nameof(request.Quantity));
        }

        var (buyerPayoff, sellerPayoff) = CalculatePayoff(
            request.AgreedPrice.Value,
            request.MarketPrice.Value,
            request.Quantity.Value
        );

        return new ForwardCalculationResponse
        {
            BuyerPayoff = buyerPayoff,
            SellerPayoff = sellerPayoff
        };
    }

    public (decimal buyerPayoff, decimal sellerPayoff) CalculatePayoff(decimal agreedPrice, decimal marketPrice, decimal quantity)
    {
        if (agreedPrice < 0)
        {
            throw new ArgumentException("Agreed forward price (K) cannot be negative.", nameof(agreedPrice));
        }

        if (marketPrice < 0)
        {
            throw new ArgumentException("Market price at maturity (S) cannot be negative.", nameof(marketPrice));
        }

        if (quantity <= 0)
        {
            throw new ArgumentException("Contract quantity (Q) must be greater than zero.", nameof(quantity));
        }

        try
        {
            checked
            {
                // Buyer Payoff = (S - K) × Q
                decimal buyerPayoff = (marketPrice - agreedPrice) * quantity;

                // Seller Payoff = (K - S) × Q
                decimal sellerPayoff = (agreedPrice - marketPrice) * quantity;

                return (buyerPayoff, sellerPayoff);
            }
        }
        catch (OverflowException)
        {
            throw new ArgumentException("The calculation resulted in an arithmetic overflow. Please provide smaller values.");
        }
    }
}
