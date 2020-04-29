import path from 'path'

import { fs, log } from '@grundstein/commons'

import { colors, getAllHostnames, writeFile } from '../lib/index.mjs'

export default config => {
  const { YELLOW, GREEN, NC } = colors

  const { INSTALL_LOG } = config

  const { USERNAME, USERHOME } = config.env

  const certDir = `/root/ca`
  const intermediateDir = `/home/grundstein/ca`

  const generateHostCertificates = config =>
    getAllHostnames(config)
      .map(
        hostname => `


printf "${YELLOW}openssl genrsa${NC} - generate priv key for ${hostname}"

openssl genrsa \\
-out ${intermediateDir}/private/${hostname}.key.pem \\
2048

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}openssl req${NC} - gen certificate request for ${hostname}"

openssl req \\
-config ${intermediateDir}/openssl.cnf \\
-key ${intermediateDir}/private/${hostname}.key.pem \\
-new -sha256 -out ${intermediateDir}/csr/${hostname}.csr.pem \\
-passin pass:\${INTERMEDIATE_PASSWORD} \\
-subj "/C=UT/ST=Utopia/L=The Net/O=Grundstein DAO/OU=Wizards and Witches/CN=${hostname}"

# -aes256 should be added once we can handle passwords

chmod 400 ${intermediateDir}/private/${hostname}.key.pem

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}openssl ca${NC} - sign certificate for ${hostname}"

openssl ca -config ${intermediateDir}/openssl.cnf \\
-extensions server_cert -days 375 -notext -md sha256 \\
-in ${intermediateDir}/csr/${hostname}.csr.pem \\
-out ${intermediateDir}/certs/${hostname}.cert.pem \\
-passin pass:\${INTERMEDIATE_PASSWORD} \\
-batch

# cat ${intermediateDir}/certs/intermediate.cert.pem >> ${intermediateDir}/certs/${hostname}.cert.pem

chmod 444 ${intermediateDir}/certs/${hostname}.cert.pem

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}openssl${NC} - verify certificate for ${hostname}"

openssl x509 -noout -text \\
-in ${intermediateDir}/certs/${hostname}.cert.pem

openssl verify -CAfile ${intermediateDir}/certs/ca-chain.cert.pem \\
  ${intermediateDir}/certs/${hostname}.cert.pem

printf " - ${GREEN}done${NC}\\n\\n"

`,
      )
      .join('\n\n\n')

  const generateServiceCertificates = config =>
    config.host.services
      .map(subdomain => {
        const hostname = `${subdomain}.${config.host.name}`

        return `

printf "${YELLOW}openssl genrsa${NC} - generate priv key for ${hostname}"

openssl genrsa \\
-out ${intermediateDir}/private/${hostname}.key.pem \\
2048

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}openssl req${NC} - gen certificate request for ${hostname}"

openssl req \\
-config ${intermediateDir}/openssl.cnf \\
-key ${intermediateDir}/private/${hostname}.key.pem \\
-new -sha256 -out ${intermediateDir}/csr/${hostname}.csr.pem \\
-passin pass:\${INTERMEDIATE_PASSWORD} \\
-subj "/C=UT/ST=Utopia/L=The Net/O=Grundstein DAO/OU=Wizards and Witches/CN=${hostname}"

# -aes256 should be added once we can handle passwords


chmod 400 ${intermediateDir}/private/${hostname}.key.pem

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}openssl ca${NC} - sign certificate for ${hostname}"

openssl ca -config ${intermediateDir}/openssl.cnf \\
-extensions server_cert -days 375 -notext -md sha256 \\
-in ${intermediateDir}/csr/${hostname}.csr.pem \\
-out ${intermediateDir}/certs/${hostname}.cert.pem \\
-passin pass:\${INTERMEDIATE_PASSWORD} \
-batch

# cat ${intermediateDir}/certs/intermediate.cert.pem >> ${intermediateDir}/certs/${hostname}.cert.pem

chmod 444 ${intermediateDir}/certs/${hostname}.cert.pem

printf " - ${GREEN}done${NC}\\n\\n"


printf "${YELLOW}openssl${NC} - verify certificate for ${hostname}"

openssl x509 -noout -text \\
-in ${intermediateDir}/certs/${hostname}.cert.pem

openssl verify -CAfile ${intermediateDir}/certs/ca-chain.cert.pem \\
  ${intermediateDir}/certs/${hostname}.cert.pem

printf " - ${GREEN}done${NC}\\n\\n"


`
      })
      .join('')

  const contents = `

printf "${YELLOW}generate certificates${NC}\\n\\n"

printf "${YELLOW}root ca${NC} - generate\\n\\n"

mkdir ${certDir}

mkdir -p ${certDir}/certs ${certDir}/crl ${certDir}/newcerts ${certDir}/private
chmod 700 ${certDir}/private
touch ${certDir}/index.txt
echo 2323 > ${certDir}/serial

printf "${YELLOW}openssl.cnf${NC} - copy\\n\\n"

cp /grundsteinlegung/bash/root-openssl.cnf ${certDir}/openssl.cnf


PASSWORD=$(makepasswd --min 42 --max 42)

printf "${YELLOW}root key${NC} - generate\\n\\n"

openssl genrsa -aes256 -out ${certDir}/private/ca.key.pem -passout pass:\${PASSWORD} 4096

chmod 400 ${certDir}/private/ca.key.pem

printf "${YELLOW}root certificate${NC} - generate\\n\\n"

openssl req \\
-config ${certDir}/openssl.cnf \\
-key ${certDir}/private/ca.key.pem \\
-new \\
-x509 \\
-days 7300 \\
-sha512 \\
-extensions v3_ca \\
-out ${certDir}/certs/ca.cert.pem \\
-passin pass:\${PASSWORD} \\
-passout pass:\${PASSWORD} \\
-subj "/C=UT/ST=Utopia/L=The Net/O=Grundstein DAO/OU=Wizards and Witches/CN=grund.stein"

chmod 444 ${certDir}/certs/ca.cert.pem

printf "${YELLOW}root certificate${NC} - test\\n\\n"

openssl x509 -noout -text -in ${certDir}/certs/ca.cert.pem  \\
>> ${INSTALL_LOG} 2>&1

printf "root ca certificate setup - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}generate intermediary ca${NC}\\n\\n"


mkdir ${intermediateDir}


mkdir \\
${intermediateDir}/certs \\
${intermediateDir}/crl \\
${intermediateDir}/csr \\
${intermediateDir}/newcerts \\
${intermediateDir}/private


chmod 700 ${intermediateDir}/private

touch ${intermediateDir}/index.txt

echo 2323 > ${intermediateDir}/serial

echo 2323 > ${intermediateDir}/crlnumber

INTERMEDIATE_PASSWORD=$(makepasswd --min 42 --max 42)


cp /grundsteinlegung/bash/intermediate-openssl.cnf ${intermediateDir}/openssl.cnf



printf "${YELLOW}openssl${NC} - intermediate genrsa"

openssl genrsa \\
-aes256 \\
-out ${intermediateDir}/private/intermediate.key.pem \\
-passout pass:\${INTERMEDIATE_PASSWORD} \\
4096 \\
>> ${INSTALL_LOG} 2>&1

chmod 400 ${intermediateDir}/private/intermediate.key.pem

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}openssl${NC} - intermediate req"

openssl req \\
-config ${intermediateDir}/openssl.cnf \\
-new \\
-sha512 \\
-key ${intermediateDir}/private/intermediate.key.pem \\
-out ${intermediateDir}/csr/intermediate.csr.pem \\
-batch \\
-passin pass:\${INTERMEDIATE_PASSWORD} \\
-passout pass:\${INTERMEDIATE_PASSWORD} \\
-subj "/C=UT/ST=Utopia/L=The Net/O=Grundstein DAO/OU=Wizards and Witches/CN=grund.stein" \\
>> ${INSTALL_LOG} 2>&1


printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}openssl${NC} - intermediate ca"

openssl ca \\
-config ${certDir}/openssl.cnf \\
-extensions v3_intermediate_ca \\
-days 3650 \\
-notext \\
-md sha512 \\
-in ${intermediateDir}/csr/intermediate.csr.pem \\
-out ${intermediateDir}/certs/intermediate.cert.pem \\
-passin pass:\${PASSWORD} \\
-batch \\
-subj "/C=UT/ST=Utopia/L=The Net/O=Grundstein DAO/OU=Wizards and Witches/CN=grund.stein" \\
>> ${INSTALL_LOG} 2>&1

chmod 444 ${intermediateDir}/certs/intermediate.cert.pem

printf " - ${GREEN}done${NC}\\n\\n"

printf "${YELLOW}intermediate certificate${NC} - verify\\n\\n"

openssl x509 -noout -text \\
-in ${intermediateDir}/certs/intermediate.cert.pem \\
>> ${INSTALL_LOG} 2>&1

printf "x509 ${GREEN}passed${NC}\\n\\n"

openssl verify \\
-CAfile ${certDir}/certs/ca.cert.pem \\
${intermediateDir}/certs/intermediate.cert.pem \\
# >> ${INSTALL_LOG} 2>&1

printf "verify ${GREEN}passed${NC}\\n\\n"


printf "${YELLOW}certificate chain${NC} - generate\\n"

cat \\
  ${intermediateDir}/certs/intermediate.cert.pem \\
  ${certDir}/certs/ca.cert.pem \\
> ${intermediateDir}/certs/ca-chain.cert.pem

chmod 444 ${intermediateDir}/certs/ca-chain.cert.pem

printf "intermediate certificate - ${GREEN}checked${NC}\\n\\n"

printf "intermediate ca setup - ${GREEN}done${NC}\\n\\n"

${generateHostCertificates(config)}


${generateServiceCertificates(config)}

chown ${USERNAME}:root -R ${USERHOME}/ca

printf "certificates: ${GREEN}generated${NC}"
`.trimStart()

  return contents
}
