export const computeEngine = {
  loadModel: async (contract) => {
    switch (contract) {
      case '7217c36c086453209ac25b5aeb2e947d5ea1f237': // Average contract
        return {
          async compute(data) {
            const values = data.map(d => d.value);
            return values.reduce((a, b) => a + b, 0) / values.length;
          },
          async verify() {
            return true;
          }
        };
      case 'sum': // Sum contract
        return {
          async compute(data) {
            const values = data.map(d => d.value);
            return values.reduce((a, b) => a + b, 0);
          },
          async verify() {
            return true;
          }
        };
      default:
        throw new Error('Unknown compute contract');
    }
  }
};