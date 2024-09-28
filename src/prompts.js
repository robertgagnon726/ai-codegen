// src/prompts.js

/**
 * Generate a prompt for creating a new test case for an added function.
 * @param {string} functionName - The name of the new function.
 * @param {string} functionDescription - A brief description of what the function does.
 * @param {string} functionCode - The actual code of the function.
 * @returns {string} - The generated prompt.
 */
function generateNewTestPrompt(functionName, functionDescription, functionCode) {
    return `
  You are a test engineer. Your task is to create a new unit test for the following function that has been added to the codebase.
  
  Function Name: ${functionName}
  
  Description: ${functionDescription}
  
  Code:
  ${functionCode}
  
  Write a comprehensive test case that covers all edge cases and possible inputs.
    `;
  }
  
  /**
   * Generate a prompt for modifying existing tests based on a function change.
   * @param {string} functionName - The name of the modified function.
   * @param {string} changesDescription - A description of the changes made to the function.
   * @param {string} existingTestCode - The current test code that needs modification.
   * @returns {string} - The generated prompt.
   */
  function modifyTestPrompt(functionName, changesDescription, existingTestCode) {
    return `
  You are a test engineer. A function in the codebase has been modified, and the corresponding test cases need to be updated.
  
  Function Name: ${functionName}
  
  Changes: ${changesDescription}
  
  Existing Test Code:
  ${existingTestCode}
  
  Update the test code to reflect the recent changes. Ensure that all new behaviors and edge cases are accounted for.
    `;
  }
  
  /**
   * Generate a prompt for suggesting which test cases should be deleted.
   * @param {string} functionName - The name of the function that has been removed.
   * @param {string} testCode - The code of the existing tests for this function.
   * @returns {string} - The generated prompt.
   */
  function deleteTestPrompt(functionName, testCode) {
    return `
  You are a test engineer. The following function has been removed from the codebase, and the corresponding test cases should be deleted.
  
  Function Name: ${functionName}
  
  Current Test Code:
  ${testCode}
  
  Identify and delete the test cases that are no longer relevant. If any test cases should be retained, specify which ones and why.
    `;
  }
  
  module.exports = {
    generateNewTestPrompt,
    modifyTestPrompt,
    deleteTestPrompt,
  };
  