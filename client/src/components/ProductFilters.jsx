
function ProductFilters({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
}) {
  return (
    <div className="product-filters">
      <input
        type="search"
        placeholder="Search clothes..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search products"
      />

      <div className="category-filters">
        {["All", "Men", "Women"].map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        aria-label="Sort products"
      >
        <option value="default">Featured</option>
        <option value="low-high">Price: Low to High</option>
        <option value="high-low">Price: High to Low</option>
        <option value="name">Name: A to Z</option>
      </select>
    </div>
  );
}

export default ProductFilters;
