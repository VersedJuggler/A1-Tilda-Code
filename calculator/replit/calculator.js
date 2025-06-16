document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let propertyPrice = 0;
    let downPayment = 0;
    let loanAmount = 0;
    let loanTerm = 0;
    let interestRate = 0;
    let paymentType = 'annuity';
    
    // Get DOM elements
    const propertyPriceInput = document.getElementById('propertyPrice');
    const propertyCurrencySelect = document.getElementById('propertyCurrency');
    const downPaymentInput = document.getElementById('downPayment');
    const downPaymentTypeSelect = document.getElementById('downPaymentType');
    const loanTermInput = document.getElementById('loanTerm');
    const loanTermTypeSelect = document.getElementById('loanTermType');
    const interestRateInput = document.getElementById('interestRate');
    const paymentTypeRadios = document.getElementsByName('paymentType');
    
    // Get display elements
    const loanAmountDisplay = document.getElementById('loanAmountDisplay');
    const monthlyPaymentDesktopDisplay = document.getElementById('monthlyPaymentDesktopDisplay');
    const monthlyPaymentMobileDisplay = document.getElementById('monthlyPaymentMobileDisplay');
    const downPaymentDisplayDesktop = document.getElementById('downPaymentDisplayDesktop');
    const downPaymentDisplayMobile = document.getElementById('downPaymentDisplayMobile');
    const monthlyPaymentMobile = document.getElementById('monthlyPaymentMobile');
    
    // Get error message elements
    const propertyPriceError = document.getElementById('propertyPriceError');
    const downPaymentError = document.getElementById('downPaymentError');
    const loanTermError = document.getElementById('loanTermError');
    const interestRateError = document.getElementById('interestRateError');
    
    // Initialize with default values
    propertyPriceInput.value = "10000000";
    downPaymentInput.value = "3000000";
    loanTermInput.value = "20";
    interestRateInput.value = "7.5";
    
    // Add event listeners
    propertyPriceInput.addEventListener('input', updateCalculation);
    propertyCurrencySelect.addEventListener('change', updateCalculation);
    downPaymentInput.addEventListener('input', updateCalculation);
    downPaymentTypeSelect.addEventListener('change', updateCalculation);
    loanTermInput.addEventListener('input', updateCalculation);
    loanTermTypeSelect.addEventListener('change', updateCalculation);
    interestRateInput.addEventListener('input', updateCalculation);
    
    // Add event listeners for payment type
    for (let radio of paymentTypeRadios) {
      radio.addEventListener('change', function() {
        paymentType = this.value;
        updateCalculation();
      });
    }
    
    // Initial calculation
    updateCalculation();
    
    // Update responsive display
    window.addEventListener('resize', updateResponsiveDisplay);
    updateResponsiveDisplay();
    
    // Function to update responsive display based on screen width
    function updateResponsiveDisplay() {
      if (window.innerWidth <= 768) {
        monthlyPaymentMobile.classList.add('show');
      } else {
        monthlyPaymentMobile.classList.remove('show');
      }
    }
    
    // Main calculation function
    function updateCalculation() {
      // Reset error states
      resetErrorStates();
      
      // Get and validate inputs
      if (!validateInputs()) {
        return;
      }
      
      // Calculate values
      calculateValues();
      
      // Update displays
      updateDisplays();
    }
    
    // Validate all inputs
    function validateInputs() {
      let isValid = true;
      
      // Validate property price (max 100M)
      propertyPrice = parseFloat(propertyPriceInput.value) || 0;
      if (propertyPrice > 100000000) {
        showError(propertyPriceInput, propertyPriceError);
        isValid = false;
      }
      
      // Validate down payment (max 50% or 50M)
      downPayment = parseFloat(downPaymentInput.value) || 0;
      if (downPaymentTypeSelect.value === 'percent') {
        if (downPayment > 50) {
          showError(downPaymentInput, downPaymentError);
          isValid = false;
        } else {
          downPayment = (propertyPrice * downPayment) / 100;
        }
      } else {
        if (downPayment > 50000000 || downPayment > propertyPrice) {
          showError(downPaymentInput, downPaymentError);
          isValid = false;
        }
      }
      
      // Validate loan term (max 30 years or 360 months)
      loanTerm = parseFloat(loanTermInput.value) || 0;
      const maxTerm = loanTermTypeSelect.value === 'years' ? 30 : 360;
      if (loanTerm > maxTerm) {
        showError(loanTermInput, loanTermError);
        isValid = false;
      }
      
      // Validate interest rate (max 100%)
      interestRate = parseFloat(interestRateInput.value) || 0;
      if (interestRate > 100) {
        showError(interestRateInput, interestRateError);
        isValid = false;
      }
      
      return isValid;
    }
    
    // Calculate loan values
    function calculateValues() {
      // Calculate loan amount
      loanAmount = propertyPrice - downPayment;
      
      // Convert loan term to months if needed
      const loanTermMonths = loanTermTypeSelect.value === 'years' ? loanTerm * 12 : loanTerm;
      
      // Calculate monthly payment based on payment type
      let monthlyPayment = 0;
      
      if (paymentType === 'annuity') {
        // Annuity payment formula
        const monthlyRate = interestRate / 100 / 12;
        if (monthlyRate === 0) {
          monthlyPayment = loanAmount / loanTermMonths;
        } else {
          const factor = Math.pow(1 + monthlyRate, loanTermMonths);
          monthlyPayment = loanAmount * monthlyRate * factor / (factor - 1);
        }
      } else {
        // Differentiated payment (first payment)
        const principal = loanAmount / loanTermMonths;
        const interest = loanAmount * (interestRate / 100 / 12);
        monthlyPayment = principal + interest;
      }
      
      // Store calculated values
      return {
        loanAmount: loanAmount,
        monthlyPayment: monthlyPayment
      };
    }
    
    // Update display with calculated values
    function updateDisplays() {
      const results = calculateValues();
      
      // Format currency symbol
      const currencySymbol = propertyCurrencySelect.value === 'rub' ? '₽' : '$';
      
      // Update loan amount display
      loanAmountDisplay.textContent = formatCurrency(results.loanAmount, currencySymbol);
      
      // Update monthly payment displays
      monthlyPaymentDesktopDisplay.textContent = formatCurrency(results.monthlyPayment, currencySymbol);
      monthlyPaymentMobileDisplay.textContent = formatCurrency(results.monthlyPayment, currencySymbol);
      
      // Update down payment displays
      const downPaymentText = `Первоначальный взнос — ${formatCurrency(downPayment, currencySymbol)}`;
      downPaymentDisplayDesktop.textContent = downPaymentText;
      downPaymentDisplayMobile.textContent = downPaymentText;
    }
    
    // Helper function to format currency
    function formatCurrency(value, symbol) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Math.round(value)) + ' ' + symbol;
    }
    
    // Show error state for an input
    function showError(inputElement, errorElement) {
      inputElement.classList.add('error-input');
      errorElement.classList.remove('hidden');
    }
    
    // Reset all error states
    function resetErrorStates() {
      // Reset inputs
      propertyPriceInput.classList.remove('error-input');
      downPaymentInput.classList.remove('error-input');
      loanTermInput.classList.remove('error-input');
      interestRateInput.classList.remove('error-input');
      
      // Hide error messages
      propertyPriceError.classList.add('hidden');
      downPaymentError.classList.add('hidden');
      loanTermError.classList.add('hidden');
      interestRateError.classList.add('hidden');
    }
    
    // Apply input masks
    if (typeof Inputmask !== 'undefined') {
      Inputmask({
        alias: 'numeric',
        groupSeparator: ' ',
        autoGroup: true,
        digits: 0,
        digitsOptional: false,
        prefix: '',
        placeholder: '0'
      }).mask(propertyPriceInput);
      
      Inputmask({
        alias: 'numeric',
        groupSeparator: ' ',
        autoGroup: true,
        digits: 0,
        digitsOptional: false,
        prefix: '',
        placeholder: '0'
      }).mask(downPaymentInput);
      
      Inputmask({
        alias: 'numeric', 
        groupSeparator: ' ',
        autoGroup: false,
        digits: 0,
        digitsOptional: false,
        prefix: '',
        placeholder: '0'
      }).mask(loanTermInput);
      
      Inputmask({
        alias: 'numeric',
        groupSeparator: ' ',
        autoGroup: false,
        digits: 2,
        digitsOptional: true,
        prefix: '',
        placeholder: '0'
      }).mask(interestRateInput);
    }
  });
  