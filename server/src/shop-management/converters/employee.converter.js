/* eslint-disable no-param-reassign */
const convertEmployeeForResponse = (employeeJson) => {
  delete employeeJson.department;
  delete employeeJson.position;
  delete employeeJson.user;
  return employeeJson;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertEmployeeForResponse,
};
