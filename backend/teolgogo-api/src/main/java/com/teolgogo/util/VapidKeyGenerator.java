package com.teolgogo.util;

import nl.martijndwars.webpush.Subscription;
import nl.martijndwars.webpush.Utils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.jose4j.jwk.PublicJsonWebKey;
import org.jose4j.lang.JoseException;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.Security;
import java.util.Base64;

/**
 * VAPID 키 생성을 위한 유틸리티 클래스
 * 애플리케이션 실행 없이 키를 생성할 수 있습니다.
 *
 * 실행 방법:
 * 1. 이 파일을 com.teolgogo.util 패키지에 추가
 * 2. 다음 명령으로 실행: mvn exec:java -Dexec.mainClass="com.teolgogo.util.VapidKeyGenerator"
 */
public class VapidKeyGenerator {
    public static void main(String[] args) {
        try {
            // BouncyCastle 보안 제공자 등록
            if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
                Security.addProvider(new BouncyCastleProvider());
            }

            // 키 페어 생성 (직접 생성 메서드 사용)
            KeyPair keyPair = generateKeyPair();

            // 공개키와 개인키 변환
            PublicJsonWebKey jwk = PublicJsonWebKey.Factory.newPublicJwk(keyPair.getPublic());
            jwk.setPrivateKey(keyPair.getPrivate());
            String publicKey = Base64.getUrlEncoder().withoutPadding().encodeToString(jwk.getPublicKey().getEncoded());
            String privateKey = Base64.getUrlEncoder().withoutPadding().encodeToString(jwk.getPrivateKey().getEncoded());

            // 결과 출력
            System.out.println("\n======== VAPID Keys ========");
            System.out.println("Public Key: " + publicKey);
            System.out.println("Private Key: " + privateKey);
            System.out.println("============================\n");
            System.out.println("application.yml에 추가할 설정:");
            System.out.println("app:");
            System.out.println("  web-push:");
            System.out.println("    public-key: " + publicKey);
            System.out.println("    private-key: " + privateKey);
            System.out.println("    subject: mailto:contact@teolgogo.com");
        } catch (Exception e) {
            System.err.println("VAPID 키 생성 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * ECDH 알고리즘을 사용하여 공개키/개인키 쌍을 생성합니다.
     * 웹 푸시 알림에서 VAPID 키 생성을 위해 사용됩니다.
     *
     * @return 생성된 KeyPair 객체
     * @throws NoSuchAlgorithmException 지원되지 않는 알고리즘 예외
     */
    private static KeyPair generateKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
        keyPairGenerator.initialize(256);
        return keyPairGenerator.generateKeyPair();
    }
}