package com.ciblorgasport.common.crypto;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
@Component
public class StringEncryptConverter implements AttributeConverter<String, String> {

	private static final String ALGORITHM = "AES/GCM/NoPadding";
	private static final int GCM_TAG_LENGTH = 128;
	private static final int GCM_IV_LENGTH = 12;

	@Value("${encryption.secret-key}")
	private String secretKey;

	@Override
	public String convertToDatabaseColumn(String attribute) {
		if (attribute == null) {
			return null;
		}
		try {
			byte[] keyBytes = hexToBytes(secretKey);
			SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

			byte[] iv = new byte[GCM_IV_LENGTH];
			java.security.SecureRandom.getInstanceStrong().nextBytes(iv);

			Cipher cipher = Cipher.getInstance(ALGORITHM);
			cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

			byte[] encrypted = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));

			byte[] combined = new byte[iv.length + encrypted.length];
			System.arraycopy(iv, 0, combined, 0, iv.length);
			System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

			return Base64.getEncoder().encodeToString(combined);
		} catch (GeneralSecurityException e) {
			throw new RuntimeException("Erreur lors du chiffrement", e);
		}
	}

	@Override
	public String convertToEntityAttribute(String dbData) {
		if (dbData == null) {
			return null;
		}
		try {
			byte[] keyBytes = hexToBytes(secretKey);
			SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

			byte[] combined = Base64.getDecoder().decode(dbData);

			byte[] iv = new byte[GCM_IV_LENGTH];
			System.arraycopy(combined, 0, iv, 0, iv.length);

			byte[] encrypted = new byte[combined.length - iv.length];
			System.arraycopy(combined, iv.length, encrypted, 0, encrypted.length);

			Cipher cipher = Cipher.getInstance(ALGORITHM);
			cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

			byte[] decrypted = cipher.doFinal(encrypted);
			return new String(decrypted, StandardCharsets.UTF_8);
		} catch (GeneralSecurityException e) {
			throw new RuntimeException("Erreur lors du déchiffrement", e);
		}
	}

	private byte[] hexToBytes(String hex) {
		int len = hex.length();
		byte[] data = new byte[len / 2];
		for (int i = 0; i < len; i += 2) {
			data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
					+ Character.digit(hex.charAt(i + 1), 16));
		}
		return data;
	}
}
