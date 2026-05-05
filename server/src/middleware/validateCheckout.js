/**
 * Validates the checkout request body for the 50% advance + 50% COD flow.
 */
export function validateCheckout(req, res, next) {
  const {
    email, firstName, lastName, address, city, phone,
    advanceMethod, items,
    billingOption,
    billFirstName, billLastName, billAddress, billCity, billPhone,
  } = req.body;

  const errors = [];

  // Contact
  if (!email?.trim()) {
    errors.push('Email or phone number is required.');
  }

  // Delivery
  if (!firstName?.trim()) errors.push('First name is required.');
  if (!lastName?.trim())  errors.push('Last name is required.');
  if (!address?.trim())   errors.push('Address is required.');
  if (!city?.trim())      errors.push('City is required.');
  if (!phone?.trim())     errors.push('Phone is required.');

  // Advance payment method
  const validAdvanceMethods = ['card', 'easypaisa', 'jazzcash', 'bank'];
  if (!validAdvanceMethods.includes(advanceMethod)) {
    errors.push('Advance payment method must be one of: card, easypaisa, jazzcash, bank.');
  }

  // Items
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Cart cannot be empty.');
  } else {
    items.forEach((item, idx) => {
      if (!item.productId)              errors.push(`Item ${idx + 1}: productId is required.`);
      if (!item.quantity || item.quantity < 1) errors.push(`Item ${idx + 1}: quantity must be ≥ 1.`);
    });
  }

  // Billing address (only when the user chose a different one)
  if (billingOption === 'different') {
    if (!billFirstName?.trim()) errors.push('Billing first name is required.');
    if (!billLastName?.trim())  errors.push('Billing last name is required.');
    if (!billAddress?.trim())   errors.push('Billing address is required.');
    if (!billCity?.trim())      errors.push('Billing city is required.');
    if (!billPhone?.trim())     errors.push('Billing phone is required.');
  }

  if (errors.length > 0) {
    return res.status(422).json({ message: 'Validation failed.', errors });
  }

  next();
}