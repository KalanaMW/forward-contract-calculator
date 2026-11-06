using ForwardContract.Api.Models;

namespace ForwardContract.Api.Services;

public interface IForwardCalculationService
{
    ForwardCalculationResponse CalculatePayoff(ForwardCalculationRequest request);
    (decimal buyerPayoff, decimal sellerPayoff) CalculatePayoff(decimal agreedPrice, decimal marketPrice, decimal quantity);
}
