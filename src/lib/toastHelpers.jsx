import { toast } from "react-toastify";
import React from "react";
import ToastIcon from "../components/Toast/ToastIcon.jsx"; // required for JSX

export function showReviewSuccess() {
    toast.success("Your review has been saved!", {
            icon: <ToastIcon src="/images/review-success.png" />
    });

    // toast.error("Something went wrong!", {
    //     icon: <ToastIcon src="/images/error-icon.png" />
    // });
}