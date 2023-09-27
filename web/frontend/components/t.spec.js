describe('test--', () => {
  it('test', () => {
    const isPartiallySoldCasesEnabled = true;
    const exitingProduct = {
      variants: [
        {
          numberOfExcessOrders: 1,
          numberOfRemainingOrders: 2
        },
        {
          numberOfExcessOrders: 3,
          numberOfRemainingOrders: 4
        }
      ]
    };

    const numberOfExcessOutstandingItems =
      exitingProduct?.variants?.reduce((acc, v) => {
        const addedValue = isPartiallySoldCasesEnabled
          ? v?.numberOfExcessOrders || 0
          : v?.numberOfRemainingOrders || 0;

        acc = acc + addedValue;

        return acc;
      }, 0) || 0;

    expect(numberOfExcessOutstandingItems).toBe(10);
  });
});
