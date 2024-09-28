/**
 * Mock a method on an instance
 * @param instance The instance to mock the method on
 * @param method The method to mock
 * @returns The mocked method
 * @example mockMethod(OpenAI.prototype.chat.completions, 'create').mockResolvedValue(mockResponse);
 */
export const mockMethod = (
  instance: any,
  method: any // Restrict K to function properties
) => {
  return jest.spyOn(instance, method) as jest.MockedFunction<any>;
};