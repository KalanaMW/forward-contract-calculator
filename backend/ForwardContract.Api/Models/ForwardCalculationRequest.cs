using System.ComponentModel.DataAnnotations;

namespace ForwardContract.Api.Models;

public class ForwardCalculationRequest
{
    [Required(ErrorMessage = "Agreed forward price (K) is required.")]
    [Range(0, double.MaxValue, ErrorMessage = "Agreed forward price (K) cannot be negative.")]
    public decimal? AgreedPrice { get; set; }

    [Required(ErrorMessage = "Market price at maturity (S) is required.")]
    [Range(0, double.MaxValue, ErrorMessage = "Market price at maturity (S) cannot be negative.")]
    public decimal? MarketPrice { get; set; }

    [Required(ErrorMessage = "Contract quantity (Q) is required.")]
    public decimal? Quantity { get; set; }
}
