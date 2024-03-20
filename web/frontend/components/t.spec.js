describe('test--', () => {
  it('test', () => {
    const exitingProduct = {
      variants: [
        {
          numberOfExcessOrders: 1,
        },
        {
          numberOfExcessOrders: 3,
        }
      ]
    };

    const numberOfExcessOutstandingItems =
      exitingProduct?.variants?.reduce((acc, v) => {
        const addedValue = v?.numberOfExcessOrders || 0;

        acc = acc + addedValue;

        return acc;
      }, 0) || 0;

    expect(numberOfExcessOutstandingItems).toBe(10);
  });
});
