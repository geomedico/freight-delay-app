const mockMessages = {
  create: jest.fn(),
};

const twilioMock = jest.fn(() => ({
  messages: mockMessages,
}));

export default twilioMock;
