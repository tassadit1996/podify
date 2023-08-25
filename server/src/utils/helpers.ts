export const generateToken = () => {
	let otp = "";
	for (let i = 0; i < 6; i++) {
		const digit = Math.floor(Math.random() * 10);
		otp += digit;
	}
	return otp;
};
