const getShortGeoDID = (geoDID) => `${geoDID.substr(0, 15)}... ${geoDID.substr(-4)}`;

export default getShortGeoDID;
