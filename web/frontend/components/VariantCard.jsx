function VariantCard({ variant, index }) {
  return (
    <div
      key={variant.id}
      style={{
        flexGrow: 1,
        border: '1px solid black',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: index % 2 === 0 ? 'lightgray' : 'white'
      }}
    >
      <p>
        <strong>title:</strong>
        {variant.title}
      </p>

      <p>
        <strong>price:</strong>
        {variant.price}
      </p>

      <p>
        <strong>inventoryPolicy:</strong>
        {variant.inventory_policy}
      </p>

      {variant?.inventory_policy?.toUpperCase() !== 'CONTINUE' && (
        <p>
          <strong>inventory Quantity:</strong>
          {variant.inventory_quantity}
        </p>
      )}
    </div>
  );
}

export { VariantCard };
