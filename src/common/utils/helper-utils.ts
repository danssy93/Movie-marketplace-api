import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export class Helpers {
  static async fetchMockfile(
    folderPath: string,
    fileName: string,
  ): Promise<any> {
    try {
      const fullPath = path.resolve(
        process.cwd(),
        `${folderPath}/${fileName}.json`,
      );

      const file = await fs.promises.readFile(fullPath, 'utf-8');

      return JSON.parse(file);
    } catch (error) {
      throw new Error(
        `Unable to load mock file: ${fileName}.json - ${error.message}`,
      );
    }
  }

  static generateReference() {
    const paymentRef = `${randomUUID().replace(/-/g, '').toUpperCase()}`;
    return paymentRef;
  }

  static sumAmountFormatter = (
    actualAmount: number,
    amountToBeAdded: number,
  ) => {
    const formattedActualAmountInKobo = Math.round(actualAmount * 100);

    const formattedAmountToBeAddedInKobo = Math.round(amountToBeAdded * 100);

    const totalAmountInKobo =
      formattedActualAmountInKobo + formattedAmountToBeAddedInKobo;

    const totalAmount = (totalAmountInKobo / 100).toFixed(2);

    return Number(totalAmount);
  };

  static subtractAmountFormatter = (
    actualAmount: number,
    deductableAmount: number,
  ) => {
    const formattedActualAmountInKobo = Math.round(actualAmount * 100);

    const formattedDeductableAmountInKobo = Math.round(deductableAmount * 100);

    const totalAmountInKobo =
      formattedActualAmountInKobo - formattedDeductableAmountInKobo;

    const totalAmount = (totalAmountInKobo / 100).toFixed(2);

    return Number(totalAmount);
  };
}
