const JobTypes = {
  CONFIRM_S3_OBJECT_USAGE: 'confirm_s3_object_usage',
  REMOVE_S3_OBJECT_USAGE: 'remove_s3_object_usage',
  AUDIT_S3_OBJECT: 'audit_s3_object',
  LOG_KITCHEN: 'log_kitchen',
  LOG_ORDER: 'log_order',
  PAY_ORDER: 'pay_order',
  CANCEL_ORDER: 'cancel_order',
  CANCEL_ORDER_PAID_STATUS: 'cancel_order_paid_status',
  UPDATE_FULL_ORDER_SESSION: 'update_full_order_session',
};

module.exports = {
  JobTypes,
};
