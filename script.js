/*
 * ============================================================
 * 注册页面 - 表单验证与交互逻辑
 * ============================================================
 *
 * 技术要点对照表:
 *   DOM 操作    √ 表单元素获取/属性修改/事件监听
 *   正则匹配    √ 邮箱 / 手机号 / 密码强度
 *   事件监听    √ submit / input / focus / blur / click
 *   密码强度    √ 多维度评估 + 动态进度条
 * ============================================================
 */

// ==================== DOM 元素缓存 ====================
const $ = (id) => document.getElementById(id);

const form = $("registerForm");
const usernameInput = $("username");
const emailInput = $("email");
const passwordInput = $("password");
const confirmPasswordInput = $("confirmPassword");
const phoneInput = $("phone");
const agreeTermsCheckbox = $("agreeTerms");
const submitBtn = $("submitBtn");

// 错误提示元素
const usernameError = $("usernameError");
const emailError = $("emailError");
const passwordError = $("passwordError");
const confirmPasswordError = $("confirmPasswordError");
const phoneError = $("phoneError");
const agreeTermsError = $("agreeTermsError");

// 密码相关
const passwordStrength = $("passwordStrength");
const togglePassword = $("togglePassword");
const toggleConfirmPassword = $("toggleConfirmPassword");

// 成功弹窗
const successModal = $("successModal");
const welcomeUsername = $("welcomeUsername");
const closeModal = $("closeModal");

// ==================== 正则表达式 ====================
const patterns = {
    username: /^[a-zA-Z0-9_]{3,20}$/,           // 3-20位字母数字下划线
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,          // 基础邮箱格式
    phone: /^1[3-9]\d{9}$/,                        // 中国大陆手机号
    passwordLower: /[a-z]/,
    passwordUpper: /[A-Z]/,
    passwordDigit: /\d/,
    passwordSpecial: /[@$!%*?&]/,
};

// ==================== 验证状态 ====================
const validationState = {
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: true,    // 可选字段,默认通过
    agreeTerms: false,
};

// ==================== 验证函数 ====================

/*
 * validateUsername — 验证用户名
 * 规则: 3-20位,字母/数字/下划线
 */
function validateUsername() {
    const value = usernameInput.value.trim();

    if (!value) {
        showError(usernameInput, usernameError, "请输入用户名");
        return false;
    }
    if (!patterns.username.test(value)) {
        showError(usernameInput, usernameError, "用户名需为3-20位字母、数字或下划线");
        return false;
    }

    showSuccess(usernameInput, usernameError);
    return true;
}

/*
 * validateEmail — 验证邮箱
 */
function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) {
        showError(emailInput, emailError, "请输入邮箱地址");
        return false;
    }
    if (!patterns.email.test(value)) {
        showError(emailInput, emailError, "邮箱格式不正确");
        return false;
    }

    showSuccess(emailInput, emailError);
    return true;
}

/*
 * validatePassword — 验证密码 + 更新强度条
 * 规则: 至少8位,含大小写字母和数字
 */
function validatePassword() {
    const value = passwordInput.value;

    // 更新强度条(无论是否通过)
    updatePasswordStrength(value);

    if (!value) {
        showError(passwordInput, passwordError, "请输入密码");
        return false;
    }
    if (value.length < 8) {
        showError(passwordInput, passwordError, "密码至少8位");
        return false;
    }
    if (!patterns.passwordLower.test(value)) {
        showError(passwordInput, passwordError, "密码需包含小写字母");
        return false;
    }
    if (!patterns.passwordUpper.test(value)) {
        showError(passwordInput, passwordError, "密码需包含大写字母");
        return false;
    }
    if (!patterns.passwordDigit.test(value)) {
        showError(passwordInput, passwordError, "密码需包含数字");
        return false;
    }

    showSuccess(passwordInput, passwordError);

    // 如果确认密码已填写,同步验证
    if (confirmPasswordInput.value) {
        validationState.confirmPassword = validateConfirmPassword();
    }
    return true;
}

/*
 * validateConfirmPassword — 验证确认密码
 */
function validateConfirmPassword() {
    const value = confirmPasswordInput.value;
    const originalValue = passwordInput.value;

    if (!value) {
        showError(confirmPasswordInput, confirmPasswordError, "请再次输入密码");
        return false;
    }
    if (value !== originalValue) {
        showError(confirmPasswordInput, confirmPasswordError, "两次输入的密码不一致");
        return false;
    }

    showSuccess(confirmPasswordInput, confirmPasswordError);
    return true;
}

/*
 * validatePhone — 验证手机号(可选)
 */
function validatePhone() {
    const value = phoneInput.value.trim();

    if (!value) {
        showSuccess(phoneInput, phoneError);  // 空值通过
        return true;
    }
    if (!patterns.phone.test(value)) {
        showError(phoneInput, phoneError, "手机号格式不正确");
        return false;
    }

    showSuccess(phoneInput, phoneError);
    return true;
}

/*
 * validateAgreeTerms — 验证是否同意协议
 */
function validateAgreeTerms() {
    if (!agreeTermsCheckbox.checked) {
        showError(null, agreeTermsError, "请先同意用户协议和隐私政策");
        return false;
    }
    agreeTermsError.textContent = "";
    return true;
}

// ==================== 辅助函数 ====================

/* 显示错误 */
function showError(input, errorEl, message) {
    if (input) {
        input.classList.remove("success");
        input.classList.add("error");
    }
    errorEl.textContent = message;
}

/* 显示成功 */
function showSuccess(input, errorEl) {
    if (input) {
        input.classList.remove("error");
        input.classList.add("success");
    }
    errorEl.textContent = "";
}

/* 更新密码强度条 */
function updatePasswordStrength(password) {
    // 清除旧的强度条
    passwordStrength.innerHTML = "";

    if (!password) return;

    // 计分: 长度 +4 / 小写 +1 / 大写 +1 / 数字 +1 / 特殊 +1
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (patterns.passwordLower.test(password)) score++;
    if (patterns.passwordUpper.test(password)) score++;
    if (patterns.passwordDigit.test(password)) score++;
    if (patterns.passwordSpecial.test(password)) score++;

    // 生成3段强度条
    const level = score <= 2 ? 1 : score <= 4 ? 2 : 3;  // 1弱 2中 3强

    for (let i = 0; i < 3; i++) {
        const bar = document.createElement("div");
        bar.className = "strength-bar";
        if (i < level) {
            bar.classList.add(level === 1 ? "weak" : level === 2 ? "medium" : "strong");
        }
        passwordStrength.appendChild(bar);
    }
}

/* 更新提交按钮状态 */
function updateSubmitBtn() {
    const allValid = Object.values(validationState).every((v) => v);
    submitBtn.disabled = !allValid;
}

// ==================== 事件绑定 ====================

// 用户名
usernameInput.addEventListener("input", () => {
    validationState.username = validateUsername();
    updateSubmitBtn();
});

// 邮箱
emailInput.addEventListener("input", () => {
    validationState.email = validateEmail();
    updateSubmitBtn();
});

// 密码
passwordInput.addEventListener("input", () => {
    validationState.password = validatePassword();
    updateSubmitBtn();
});

// 确认密码
confirmPasswordInput.addEventListener("input", () => {
    validationState.confirmPassword = validateConfirmPassword();
    updateSubmitBtn();
});

// 手机号
phoneInput.addEventListener("input", () => {
    validationState.phone = validatePhone();
    updateSubmitBtn();
});

// 协议勾选
agreeTermsCheckbox.addEventListener("change", () => {
    validationState.agreeTerms = validateAgreeTerms();
    updateSubmitBtn();
});

// 密码可见切换
togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
});

toggleConfirmPassword.addEventListener("click", () => {
    const type = confirmPasswordInput.type === "password" ? "text" : "password";
    confirmPasswordInput.type = type;
});

// 表单提交
form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 最终校验(点击提交时强制校验所有字段)
    validationState.username = validateUsername();
    validationState.email = validateEmail();
    validationState.password = validatePassword();
    validationState.confirmPassword = validateConfirmPassword();
    validationState.phone = validatePhone();
    validationState.agreeTerms = validateAgreeTerms();

    if (Object.values(validationState).every((v) => v)) {
        // 模拟注册成功(实际应发送到后端)
        handleRegisterSuccess(usernameInput.value.trim());
    }
});

// 成功弹窗关闭
closeModal.addEventListener("click", () => {
    successModal.classList.remove("show");
    form.reset();
    // 清除所有输入框状态
    document.querySelectorAll(".input-wrapper input").forEach((input) => {
        input.classList.remove("success", "error");
    });
    Object.keys(validationState).forEach((key) => {
        validationState[key] = key === "phone" ? true : false;
    });
    passwordStrength.innerHTML = "";
    updateSubmitBtn();
});

// ==================== 注册成功处理 ====================
function handleRegisterSuccess(username) {
    welcomeUsername.textContent = username;
    successModal.classList.add("show");

    // 控制台输出模拟数据(实际开发中应发送到服务器)
    console.log("=== 注册信息(模拟提交) ===");
    console.log({
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,  // ⚠️ 实际开发中绝不能这样输出!
        phone: phoneInput.value.trim() || "(未填写)",
    });
}

// ==================== 初始化 ====================
updateSubmitBtn();  // 初始按钮禁用
