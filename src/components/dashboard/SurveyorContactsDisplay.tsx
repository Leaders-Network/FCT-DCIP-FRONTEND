"use client";
import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    MessageCircle,
    Calendar,
    Clock,
    Award,
    ExternalLink,
    Copy,
    CheckCircle
} from 'lucide-react';

interface SurveyorContact {
    name: string;
    email: string;
    phone: string;
    organization: 'AMMC' | 'NIA';
    licenseNumber?: string;
    specialization?: string[];
    experience?: number;
    rating?: number;
    lastActive?: string;
    profileImage?: string;
}

interface SurveyorCon