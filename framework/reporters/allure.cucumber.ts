// import { AllureRuntime } from 'allure-js-commons';
// import { AllureCucumberJS } from 'allure-cucumberjs';
// import { IFormatterOptions } from '@cucumber/cucumber';
// import path from 'path';
// import { formatterHelpers } from '@cucumber/cucumber/lib/formatter/helpers';

// export default class CustomAllureFormatter extends AllureCucumberJS {
//   constructor(options: IFormatterOptions) {
//     super(
//       options,
//       new AllureRuntime({
//         resultsDir: path.resolve(__dirname, '../../reports/allure-results'),
//       }),
//       {
//         labels: {
//           feature: [/@feature:(.*?)(?=\s|$)/],
//           epic: [/@epic:(.*?)(?=\s|$)/],
//         },
//         links: {
//           issue: [/@issue=(.*?)(?=\s|$)/],
//           tms: [/@tms=(.*?)(?=\s|$)/],
//         },
//       }
//     );
//   }

//   static readonly [formatterHelpers.PROMISE_INTERFACE_SYMBOL] = true;
// }
