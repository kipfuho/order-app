const { getStringId } = require('../../utils/common');

/* eslint-disable no-param-reassign */
const convertEmployeeForResponse = (employeeJson) => {
  employeeJson.departmentId = getStringId({ object: employeeJson, key: 'department' });
  employeeJson.positionId = getStringId({ object: employeeJson, key: 'position' });

  delete employeeJson.department;
  delete employeeJson.position;
  delete employeeJson.user;
  return employeeJson;
};
/* eslint-enable no-param-reassign */

module.exports = {
  convertEmployeeForResponse,
};
