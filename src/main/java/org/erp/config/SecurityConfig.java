package org.erp.config;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.erp.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private static final Logger logger = LogManager.getLogger(SecurityConfig.class);
    private final UserDetailsServiceImpl userDetailsService;

    @Autowired
    public SecurityConfig(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
        logger.info("SecurityConfig initialized with UserDetailsService: {}", userDetailsService.getClass().getSimpleName());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring SecurityFilterChain with CSRF disabled and session-based authentication");
        
        http
            .csrf(csrf -> {
                csrf.disable();
                logger.debug("CSRF protection disabled for API endpoints");
            })
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers("/", "/login", "/dashboard", "/static/**", "/index.html", 
                                    "/favicon.ico", "/*.js", "/*.css", "/api/auth/login").permitAll()
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().authenticated();
                logger.debug("Authorization rules configured: public endpoints and authenticated API access");
            })
            .authenticationProvider(authenticationProvider())
            .sessionManagement(session -> {
                session.sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
                       .maximumSessions(1)
                       .maxSessionsPreventsLogin(false);
                logger.debug("Session management configured: max 1 session per user, no session prevention");
            })
            .logout(logout -> {
                logout.logoutUrl("/api/auth/logout")
                      .invalidateHttpSession(true)
                      .clearAuthentication(true)
                      .permitAll();
                logger.debug("Logout configuration set: /api/auth/logout with session invalidation");
            });

        logger.info("SecurityFilterChain configuration completed successfully");
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        logger.info("PasswordEncoder configured: BCrypt with strength 12");
        return encoder;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        logger.debug("Creating DaoAuthenticationProvider with custom UserDetailsService and BCrypt encoder");
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        logger.info("DaoAuthenticationProvider configured successfully");
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        AuthenticationManager manager = config.getAuthenticationManager();
        logger.info("AuthenticationManager bean created successfully");
        return manager;
    }
}