// MOCK AUTH for testing UI permissions
// Possible roles: 'full', 'couple_view', 'family_view', 'guest', 'budget', etc.
let currentRole = 'full';

export const getMockRole = () => currentRole;
export const setMockRole = (role: string) => {
  currentRole = role;
};
