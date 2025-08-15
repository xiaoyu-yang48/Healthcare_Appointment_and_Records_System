import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Switch,
    FormControlLabel,
    Typography
} from "@mui/material";
import { toast } from "react-hot-toast";
import api from "../axiosConfig";
import { t } from "../utils/i18n";

/**
 * 用户表单组件 User Form Component
 * @param {object} props
 * @param {boolean} props.open - 是否打开弹窗 Whether dialog is open
 * @param {function} props.onClose - 关闭弹窗回调 Callback to close dialog
 * @param {object|null} props.user - 编辑用户数据 Editing user data
 * @param {function} props.onSuccess - 成功回调 Success callback
 */
const UserForm = ({ open, onClose, user = null, onSuccess }) => {
    // 表单数据 Form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "patient",
        phone: "",
        specialization: "",
        department: "",
        isActive: true
    });

    // 加载状态 Loading state
    const [loading, setLoading] = useState(false);

    // 表单错误 Form errors
    const [errors, setErrors] = useState({});

    // 是否为编辑模式 Is edit mode
    const isEdit = !!user;

    // 初始化表单数据 Initialize form data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                password: "",
                role: user.role || "patient",
                phone: user.phone || "",
                specialization: user.specialization || "",
                department: user.department || "",
                isActive: user.isActive !== undefined ? user.isActive : true
            });
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "patient",
                phone: "",
                specialization: "",
                department: "",
                isActive: true
            });
        }
        setErrors({});
    }, [user, open]);

    // 表单校验 Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t("user_form.validation.name_required");
        if (!formData.email.trim()) newErrors.email = t("user_form.validation.email_required");
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("user_form.validation.email_invalid");
        if (!isEdit && !formData.password.trim()) newErrors.password = t("user_form.validation.password_required");
        else if (!isEdit && formData.password.length < 6) newErrors.password = t("user_form.validation.password_too_short");
        if (!formData.role) newErrors.role = t("user_form.validation.role_required");
        if (formData.role === "doctor") {
            if (!formData.specialization.trim()) newErrors.specialization = t("user_form.validation.specialization_required");
            if (!formData.department.trim()) newErrors.department = t("user_form.validation.department_required");
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 提交表单 Submit form
    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            const submitData = { ...formData };
            if (isEdit && !submitData.password) delete submitData.password;
            if (isEdit) {
                await api.put(`/admin/users/${user._id}`, submitData);
                toast.success(t("user_form.messages.user_updated"));
            } else {
                await api.post("/admin/users", submitData);
                toast.success(t("user_form.messages.user_created"));
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(t("user_form.messages.save_failed"), error);
            const errorMessage = error.response?.data?.message || t("user_form.messages.operation_failed");
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // 处理表单字段变化 Handle field change
    const handleChange = (field) => (event) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? t("user_form.edit_user") : t("user_form.add_user")}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <TextField
                        fullWidth
                        label={t("user_form.name")}
                        value={formData.name}
                        onChange={handleChange("name")}
                        error={!!errors.name}
                        helperText={errors.name}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label={t("user_form.email")}
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        error={!!errors.email}
                        helperText={errors.email}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label={t("user_form.password")}
                        type="password"
                        value={formData.password}
                        onChange={handleChange("password")}
                        error={!!errors.password}
                        helperText={errors.password || (isEdit ? t("user_form.messages.password_hint") : "")}
                        margin="normal"
                        required={!isEdit}
                    />
                    <FormControl fullWidth margin="normal" error={!!errors.role}>
                        <InputLabel>{t("user_form.role")}</InputLabel>
                        <Select
                            value={formData.role}
                            label={t("user_form.role")}
                            onChange={handleChange("role")}
                        >
                            <MenuItem value="patient">{t("user_form.patient")}</MenuItem>
                            <MenuItem value="doctor">{t("user_form.doctor")}</MenuItem>
                            <MenuItem value="admin">{t("user_form.admin")}</MenuItem>
                        </Select>
                        {errors.role && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                                {errors.role}
                            </Typography>
                        )}
                    </FormControl>
                    <TextField
                        fullWidth
                        label={t("user_form.phone")}
                        value={formData.phone}
                        onChange={handleChange("phone")}
                        margin="normal"
                    />
                    {formData.role === "doctor" && (
                        <>
                            <TextField
                                fullWidth
                                label={t("user_form.specialization")}
                                value={formData.specialization}
                                onChange={handleChange("specialization")}
                                error={!!errors.specialization}
                                helperText={errors.specialization}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label={t("user_form.department")}
                                value={formData.department}
                                onChange={handleChange("department")}
                                error={!!errors.department}
                                helperText={errors.department}
                                margin="normal"
                                required
                            />
                        </>
                    )}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isActive}
                                onChange={handleChange("isActive")}
                            />
                        }
                        label={t("user_form.enable_account")}
                        sx={{ mt: 2 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {t("user_form.cancel")}
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? t("user_form.saving") : (isEdit ? t("user_form.update") : t("user_form.create"))}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserForm;
