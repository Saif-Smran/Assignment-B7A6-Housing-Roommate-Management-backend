export type TCreatePropertyImage = {
	url: string;
	isPrimary?: boolean;
};

export type TCreateProperty = {
	title: string;
	description?: string;
	address: string;
	city: string;
	state?: string;
	country: string;
	zipCode?: string;
	propertyType: string;
	amenities?: string[];
	images?: TCreatePropertyImage[];
};

export type TUpdateProperty = Partial<TCreateProperty>;

export type TPropertyQueryFilters = {
	page?: string;
	limit?: string;
	city?: string;
	propertyType?: string;
	minRent?: string;
	maxRent?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
};
