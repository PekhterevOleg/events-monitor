import dotenv from 'dotenv';

dotenv.config();

const ldap_login = process.env.LDAP_LOGIN;
const ldap_password = process.env.LDAP_PASSWORD;
const ldap_url = process.env.LDAP_URL;
const ldap_ou = process.env.LDAP_OU;

const ldapConfig = {};
ldapConfig.url              = ldap_url;
ldapConfig.ou               = ldap_ou;

ldapConfig.cred             = {};
ldapConfig.cred.login       = ldap_login;
ldapConfig.cred.password    = ldap_password;

ldapConfig.opts             = {};
ldapConfig.opts.filter      = '(&(objectClass=computer)(operatingSystem=Windows Server 201*)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))';
ldapConfig.opts.scope       = 'sub';
ldapConfig.opts.attributes  = ['name', 'objectGUID', 'operatingSystem', 'cn'];


const HBStatus = {};
HBStatus.UNDEFINED          = 'undefined';
HBStatus.ACTIVE             = 'active';
HBStatus.INACTIVE           = 'inactive';

export { ldapConfig, HBStatus };
