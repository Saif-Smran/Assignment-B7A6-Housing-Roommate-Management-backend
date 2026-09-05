export type TCreateRoom = {
	roomNumber?: string;
	roomType: string;
	capacity: number;
	rentAmount: number;
	securityDeposit?: number;
	availableFrom?: string;
	availableTo?: string;
	isAvailable?: boolean;
	description?: string;
};

export type TUpdateRoom = {
	roomNumber?: string;
	roomType?: string;
	capacity?: number;
	rentAmount?: number;
	securityDeposit?: number;
	availableFrom?: string | null;
	availableTo?: string | null;
	isAvailable?: boolean;
	description?: string;
};

export type TUpdateRoomAvailability = {
	availableFrom?: string | null;
	availableTo?: string | null;
	isAvailable?: boolean;
};
