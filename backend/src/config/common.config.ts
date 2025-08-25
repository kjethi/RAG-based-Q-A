import { ConfigService, registerAs } from '@nestjs/config';
import adminConfig from './admin.config';

export default registerAs('common', () => ({
  pagination : {
    defaultRecord: 10,
  },
  ...adminConfig(),
}));
