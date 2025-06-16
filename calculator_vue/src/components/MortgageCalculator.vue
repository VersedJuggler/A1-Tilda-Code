<template>
    <div id="containerCalculator" class="mx-auto contentCalculator">
      <div class="flex flex-wrap justify-between items-start mb-5 max-w-[69rem]">
        <div class="main-title-container flex-1 h-auto flex flex-col justify-between">
          <h1 class="main-title tracking-tight">Ипотечный калькулятор</h1>
          <p class="main-title-description text-gray-600 tracking-tight">
            Получите предварительный расчёт по ипотеке, заполните анкету и получите предложения по ставке ниже, чем в банке.
          </p>
        </div>
        <div id="monthlyPaymentDesktop" class="flex-1 min-w-[18rem] max-w-[28rem] bg-white p-6 rounded-md">
          <h2 class="text-[1.75rem] tracking-tight">Ежемесячный платеж</h2>
          <p class="text-[2.25rem] font-semibold">{{ formattedMonthlyPayment }}</p>
          <p class="text-[1.2rem] mt-3 text-black tracking-tight">Первоначальный взнос — {{ formattedDownPayment }}</p>
        </div>
      </div>
  
      <div class="mb-10">
        <h1 class="text-lg font-normal tracking-tight">По стоимости недвижимости</h1>
        <div class="max-w-[255px] h-[2px] bg-black mt-1"></div>
      </div>
  
      <div class="flex flex-wrap space-y-4 md:space-y-0 md:space-x-10 items-start mb-8">
        <div>
          <label class="block font-bold mb-1 tracking-tight">Стоимость недвижимости</label>
          <input v-model.number="propertyPrice" type="number" class="p-2 border rounded" />
        </div>
  
        <div>
          <label class="block font-bold mb-1 tracking-tight">Первоначальный взнос</label>
          <input v-model.number="downPayment" type="number" class="p-2 border rounded" />
        </div>
      </div>
  
      <div class="buttons">
        <button @click="calculateMortgage" class="bg-black text-white rounded-md px-4 py-2">Рассчитать</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        propertyPrice: 0,
        downPayment: 0,
        loanTerm: 30,
        interestRate: 10,
        monthlyPayment: 0,
      };
    },
    computed: {
      formattedMonthlyPayment() {
        return this.monthlyPayment.toLocaleString("ru-RU") + " ₽";
      },
      formattedDownPayment() {
        return this.downPayment.toLocaleString("ru-RU") + " ₽";
      }
    },
    methods: {
      calculateMortgage() {
        const loanAmount = this.propertyPrice - this.downPayment;
        const termInMonths = this.loanTerm * 12;
        const monthlyRate = this.interestRate / 100 / 12;
        
        this.monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termInMonths));
      }
    }
  };
  </script>
  
  <style scoped>
  .contentCalculator {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }
  .main-title {
    font-size: 48px;
    margin-bottom: 20px;
  }
  </style>
  