function VariantCard({ variant, index }) {
  return (
    <li
      key={variant.id}
      style={{
        border: '1px solid black',
        margin: '10px',
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

      {variant.inventory_policy !== 'CONTINUE' && (
        <p>
          <strong>inventory Quantity:</strong>
          {variant.inventory_quantity}
        </p>
      )}
    </li>
  );
}

export { VariantCard };
