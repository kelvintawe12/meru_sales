/**
 * Utility functions for refinery and fractionation calculations
 */
// Refinery calculations
export const calculateRefineryYield = (refinedOil: number, feed: number): number => {
  if (feed === 0) return 0;
  return refinedOil / feed * 100;
};
export const calculatePFADYield = (pfad: number, feed: number): number => {
  if (feed === 0) return 0;
  return pfad / feed * 100;
};
export const calculateLoss = (feed: number, refinedOil: number, pfad: number): number => {
  return feed - (refinedOil + pfad);
};
export const calculateLossPercentage = (loss: number, feed: number): number => {
  if (feed === 0) return 0;
  return loss / feed * 100;
};
export const calculateActualFeed = (openingWIP: number, feed: number, closingWIP: number): number => {
  return openingWIP + feed - closingWIP;
};
// Fractionation calculations
export const calculateOleinPercentage = (olein: number, feed: number): number => {
  if (feed === 0) return 0;
  return olein / feed * 100;
};
export const calculateStearinPercentage = (stearin: number, feed: number): number => {
  if (feed === 0) return 0;
  return stearin / feed * 100;
};
export const calculateFractionationLoss = (feed: number, olein: number, stearin: number): number => {
  return feed - (olein + stearin);
};
// Soap calculations
export const calculateSoapTFM = (pfad: number, stearin: number, cpko: number, otherBlendOil: number, soapProduction: number): number => {
  if (soapProduction === 0) return 0;
  const soapTotal = pfad + stearin + cpko + otherBlendOil;
  return soapTotal / soapProduction * 100;
};
// Additive dosage calculations
export const calculateAdditiveDosage = (additiveKg: number, feedMT: number): number => {
  if (feedMT === 0) return 0;
  // Convert MT to kg for calculation
  const feedKg = feedMT * 1000;
  return additiveKg / feedKg * 100;
};
// Format number to 2 decimal places
export const formatNumber = (num: number): string => {
  return num.toFixed(2);
};
// Parse input with comma as thousand separator
export const parseNumberInput = (input: string): number => {
  if (!input) return 0;
  // Remove commas and convert to number
  return parseFloat(input.replace(/,/g, ''));
};
// Format number with comma as thousand separator
export const formatNumberWithCommas = (num: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
};

// New function to calculate stock from dip and calibration
export const calculateStockFromDip = (dipCm: number, calibrationMm: number): number => {
  // calibration is in mm, convert to cm by multiplying by 0.1 (mm to cm)
  // stock = dip in cm * calibration in kg/mm * 10 (to convert calibration to per cm)
  // The user said calibration (in mm * 10 to convert to cm), so calibrationMm * 10
  return dipCm * (calibrationMm * 10);
};
