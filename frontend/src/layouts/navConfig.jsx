import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Award,
  Briefcase,
  GitFork,
  Bell,
  HelpCircle,
  User,
  ShieldCheck,
  Home,
  Database,
  Users,
  UserCheck,
  CalendarCheck,
  Zap,
  BarChart3,
  CalendarDays,
  Gauge,
  Building2,
  Truck,
  UsersRound,
  GraduationCap,
  BadgeCheck,
  Compass,
  FileSpreadsheet,
  Network,
  Settings,
} from 'lucide-react';

 

const labeler = (language) => (en, ta, hi, te, bn) => {
  if (language === 'ta') return ta;
  if (language === 'hi') return hi;
  if (language === 'te') return te;
  if (language === 'bn') return bn;
  return en;
};

export const getRoleNav = (role, language) => {
  const L = labeler(language);
  const overviewLabel = L('Overview', 'மேலோட்டம்', 'अवलोकन', 'అవలోకనం', 'সংক্ষিপ্ত বিবরণ');

  if (role === 'admin') {
    const i = (id, label, icon) => ({ id, label, icon });
    return {
      home: 'admin_overview',
      portalName: L('Institution Console', 'நிறுவன மையம்', 'संस्थान कंसोल', 'సంస్థ కన్సోల్', 'প্রতিষ্ঠান কনসোল'),
      groups: [
        { key: 'overview', label: overviewLabel, item: i('admin_overview', L('Executive Overview', 'செயல்பாட்டு மேலோட்டம்', 'कार्यकारी अवलोकन', 'కార్యనిర్వాహక అవలోకనం', 'কার্যনির্বাহী বিবরণ'), LayoutDashboard) },
        {
          key: 'programmes',
          label: L('Programmes', 'திட்டங்கள்', 'कार्यक्रम', 'కార్యక్రమాలు', 'কর্মসূচী'),
          items: [
            i('admin_programmes', L('Courses', 'பாடநெறிகள்', 'पाठ्यक्रम', 'కోర్సులు', 'কোর্স'), BookOpen),
            i('admin_nominations', L('Nominations Control', 'பரிந்துரை கட்டுப்பாடு', 'नामांकन नियंत्रण', 'నామినేషన్ నియంత్రణ', 'মনোনয়ন নিয়ন্ত্রণ'), UserCheck),
            i('admin_timetable', L('Smart Timetable', 'அறிவார்ந்த அட்டவணை', 'स्मार्ट समय सारणी', 'స్మార్ట్ టైమ్‌టేబుల్', 'স্মার্ট সময়সূচী'), CalendarDays),
            i('admin_certification', L('Certification Pipeline', 'சான்றிதழ் குழாய்', 'प्रमाणन पाइपलाइन', 'ధృవీకరణ వ్యవస్థ', 'সার্টিফিকেশন পাইপলাইন'), BadgeCheck),
          ],
        },
        {
          key: 'operations',
          label: L('Operations', 'செயல்பாடுகள்', 'संचालन', 'కార్యకలాపాలు', 'পরিচালনা'),
          items: [
            i('admin_capacity', L('Capacity & Resources', 'திறன் & வளங்கள்', 'क्षमता और संसाधन', 'సామర్థ్యం & వనరులు', 'ক্ষমতা ও সম্পদ'), Gauge),
            i('admin_hostel', L('Hostel & Accommodation', 'விடுதி & தங்குமிடம்', 'छात्रावास और आवास', 'హాస్టల్ & వసతి', 'হোস্টেল ও আবাসন'), Building2),
            i('admin_logistics', L('Training Logistics', 'பயிற்சி தளவாடங்கள்', 'प्रशिक्षण रसद', 'శిక్షణ లాజిస్టిక్స్', 'প্রশিক্ষণ সরবরাহ'), Truck),
            i('admin_trainers', L('Trainer Capacity', 'பயிற்றுவிப்பாளர் திறன்', 'प्रशिक्षक क्षमता', 'శిక్షకుల సామర్థ్యం', 'প্রশিক্ষক ক্ষমতা'), UsersRound),
            i('admin_trainees', L('Trainees Operations', 'பயிற்சியாளர்கள் செயல்பாடுகள்', 'प्रशिक्षु संचालन', 'శిక్షణార్థుల నిర్వహణ', 'প্রশিক্ষণার্থী পরিচালনা'), GraduationCap),
          ],
        },
        {
          key: 'intelligence',
          label: L('Intelligence', 'நுண்ணறிவு', 'इंटेलिजेंस', 'ఇంటెలిజెన్స్', 'ইন্টেলিজেন্স'),
          items: [
            i('admin_analytics', L('Learning Analytics', 'கற்றல் பகுப்பாய்வு', 'सीखने का विश्लेषण', 'అభ్యాస విశ్లేషణ', 'শেখার বিশ্লেষণ'), BarChart3),
            i('admin_skills', L('Skill Intelligence', 'திறன் நுண்ணறிவு', 'कौशल बुद्धिमत्ता', 'నైపుణ్య ఇంటెలిజెన్స్', 'দক্ষতা বুদ্ধিমত্তা'), GitFork),
            i('admin_outreach', L('Outreach Intelligence', 'வெளியெல்லை நுண்ணறிவு', 'आउटरीच इंटेलिजेंस', 'ఔట్‌రీచ్ ఇంటెలిజెన్స్', 'আউটরিচ ইন্টেলিজেন্স'), Compass),
            i('admin_reports', L('Reports & Monitoring', 'அறிக்கைகள் & கண்காணிப்பு', 'रिपोर्ट और निगरानी', 'నివేదికలు & పర్యవేక్షణ', 'রিপোর্ট ও মনিটরিং'), FileSpreadsheet),
          ],
        },
        { key: 'network', label: L('Network', 'நெட்வொர்க்', 'नेटवर्क', 'నెట్‌వర్క్', 'নেটওয়ার্ক'), item: i('admin_network', L('NCCT Network Map', 'NCCT நெட்வொர்க்', 'NCCT नेटवर्क', 'NCCT నెట్‌వర్క్', 'NCCT নেটওয়ার্ক'), Network) },
        { key: 'settings', label: L('Settings', 'அமைப்புகள்', 'सेटिंग्स', 'సెట్టింగ్‌లు', 'সেটিংস'), item: i('admin_settings', L('Settings & Edge Mode', 'அமைப்புகள்', 'सेटिंग्स', 'సెట్టింగ్‌లు', 'সেটিংস'), Settings) },
      ],
      utility: [i('profile', L('Profile', 'சுயவிவரம்', 'प्रोफ़ाइल', 'ప్రొఫైల్', 'প্রোফাইল'), User)],
    };
  }

  if (role === 'trainer') {
    const i = (id, label, icon) => ({ id, label, icon });
    return {
      home: 'trainer_overview',
      portalName: L('Trainer Workspace', 'பயிற்றுவிப்பாளர் பணிப்பகுதி', 'प्रशिक्षक कार्यस्थान', 'శిక్షకుల పనిప్రాంతం', 'প্রশিক্ষক কর্মক্ষেত্র'),
      groups: [
        { key: 'overview', label: overviewLabel, item: i('trainer_overview', L('Trainer Overview', 'பயிற்றுவிப்பாளர் மேலோட்டம்', 'प्रशिक्षक अवलोकन', 'శిక్షకుల అవలోకనం', 'প্রশিক্ষক বিবরণ'), LayoutDashboard) },
        {
          key: 'batches',
          label: L('Batches & Trainees', 'குழுக்கள் & பயிற்சியாளர்கள்', 'बैच और प्रशिक्षु', 'బ్యాచ్‌లు & శిక్షణార్థులు', 'ব্যাচ ও প্রশিক্ষণার্থী'),
          items: [
            i('trainer_batches', L('My Batches', 'என் குழுக்கள்', 'मेरे बैच', 'నా బ్యాచ్‌లు', 'আমার ব্যাচ'), Users),
            i('trainer_trainees', L('Trainees Roster', 'பயிற்சியாளர்கள் பட்டியல்', 'प्रशिक्षु सूची', 'శిక్షణార్థుల జాబితా', 'প্রশিক্ষণার্থী তালিকা'), UserCheck),
            i('trainer_attendance', L('Attendance Analytics', 'வருகைப் பகுப்பாய்வு', 'उपस्थिति विश्लेषण', 'హాజరు విశ్లేషణ', 'উপস্থিতি বিশ্লেষণ'), CalendarCheck),
          ],
        },
        {
          key: 'assessment',
          label: L('Assessment & Skills', 'மதிப்பீடு & திறன்கள்', 'मूल्यांकन और कौशल', 'మూల్యాంకనం & నైపుణ్యాలు', 'মূল্যায়ন ও দক্ষতা'),
          items: [
            i('trainer_assessments', L('Assessments & Heatmap', 'மதிப்பீடுகள் & வெப்பப்படம்', 'मूल्यांकन और हीटमैप', 'మూల్యాంకనాలు & హీట్‌మ్యాప్', 'মূল্যায়ন ও হিটম্যাপ'), FileCheck2),
            i('trainer_skills', L('Batch Skill Gap Map', 'திறன் இடைவெளி வரைபடம்', 'कौशल अंतर मानचित्र', 'నైపుణ్య లోప పటం', 'দক্ষতা গ্যাপ ম্যাপ'), GitFork),
            i('trainer_competency', L('Competency Verification', 'திறன் சரிபார்ப்பு', 'योग्यता सत्यापन', 'సామర్థ్య ధృవీకరణ', 'যোগ্যতা যাচাইকরণ'), ShieldCheck),
          ],
        },
        {
          key: 'teaching',
          label: L('Teaching Support', 'கற்பித்தல் ஆதரவு', 'शिक्षण सहायता', 'బోధనా మద్దతు', 'শিক্ষণ সহায়তা'),
          items: [
            i('trainer_interventions', L('Intervention Center', 'தலையீடு மையம்', 'हस्तक्षेप केंद्र', 'జోక్య కేంద్రం', 'হস্তক্ষেপ কেন্দ্র'), Zap),
            i('trainer_resources', L('Teaching Resources', 'கற்பித்தல் வளங்கள்', 'शिक्षण संसाधन', 'బోధనా వనరులు', 'শিক্ষণ সম্পদ'), BookOpen),
          ],
        },
        { key: 'reports', label: L('Reports', 'அறிக்கைகள்', 'रिपोर्ट', 'నివేదికలు', 'রিপোর্ট'), item: i('trainer_reports', L('Reports & Exports', 'அறிக்கைகள்', 'रिपोर्ट और निर्यात', 'నివేదికలు & ఎగుమతులు', 'রিপোর্ট ও রফতানি'), BarChart3) },
      ],
      utility: [
        i('trainer_notifications', L('Notifications', 'அறிவிப்புகள்', 'सूचनाएं', 'నోటిఫికేషన్లు', 'বিজ্ঞপ্তি'), Bell),
        i('profile', L('Trainer Profile', 'பயிற்றுவிப்பாளர் சுயவிவரம்', 'प्रशिक्षक प्रोफ़ाइल', 'శిక్షకుల ప్రొఫైల్', 'প্রশিক্ষক প্রোফাইল'), User),
      ],
    };
  }

  const i = (id, label, icon) => ({ id, label, icon });
  return {
    home: 'overview',
    portalName: L('Trainee Portal', 'பயிற்சியாளர் தளம்', 'प्रशिक्षु पोर्टल', 'శిక్షణార్థి పోర్టల్', 'প্রশিক্ষণার্থী পোর্টাল'),
    groups: [
      { key: 'overview', label: overviewLabel, item: i('overview', overviewLabel, LayoutDashboard) },
      {
        key: 'learning',
        label: L('Learning', 'கற்றல்', 'शिक्षा', 'అభ్యాసం', 'শিক্ষা'),
        items: [
          i('learning', L('My Learning', 'என் கற்றல்', 'मेरी पढ़ाई', 'నా అభ్యాసం', 'আমার শিক্ষা'), BookOpen),
          i('learning_path', L('Learning Path', 'கற்றல் பாதை', 'सीखने का मार्ग', 'అభ్యాస మార్గం', 'শেখার পথ'), GitFork),
          i('assessments', L('Assessments', 'மதிப்பீடுகள்', 'मूल्यांकन', 'మూల్యాంకనాలు', 'মূল্যায়ন'), FileCheck2),
        ],
      },
      {
        key: 'credentials',
        label: L('Skills & Certificates', 'திறன்கள் & சான்றிதழ்கள்', 'कौशल और प्रमाणपत्र', 'నైపుణ్యాలు & సర్టిఫికెట్లు', 'দক্ষতা ও সার্টিফিকেট'),
        items: [
          i('skills', L('My Skills', 'என் திறன்கள்', 'मेरे कौशल', 'నా నైపుణ్యాలు', 'আমার দক্ষতা'), ShieldCheck),
          i('certificates', L('Certificates', 'சான்றிதழ்கள்', 'प्रमाणपत्र', 'సర్టిఫికెట్లు', 'সার্টিফিকেট'), Award),
        ],
      },
      { key: 'career', label: L('Careers', 'வேலைவாய்ப்பு', 'करियर', 'ఉపాధి', 'ক্যারিয়ার'), item: i('career', L('Career Opportunities', 'வேலைவாய்ப்பு', 'करियर', 'ఉపాధి అవకాశాలు', 'ক্যারিয়ার সুবিধা'), Briefcase) },
      {
        key: 'campus',
        label: L('Campus Services', 'வளாக சேவைகள்', 'परिसर सेवाएं', 'క్యాంపస్ సేవలు', 'ক্যাম্পাস পরিষেবা'),
        items: [
          i('logistics', L('Hostel & Logistics', 'விடுதி & தர்க்கவியல்', 'छात्रावास और लॉजिस्टिक्स', 'హాస్టల్ & లాజిస్టిక్స్', 'হোস্টেল ও আবাসন'), Home),
          i('erp_analytics', L('ERP Analytics', 'ERP பகுப்பாய்வு', 'ईआरपी विश्लेषण', 'ERP విశ్లేషణ', 'ERP বিশ্লেষণ'), Database),
        ],
      },
      { key: 'help', label: L('Help', 'உதவி', 'सहायता', 'సహాయం', 'সাহায্য'), item: i('help', L('Help & Support', 'உதவி & ஆதரவு', 'सहायता और सहायता', 'సహాయం & మద్దతు', 'সাহায্য ও সহায়তা'), HelpCircle) },
    ],
    utility: [
      i('notifications', L('Notifications', 'அறிவிப்புகள்', 'सूचनाएं', 'నోటిఫికేషన్లు', 'বিজ্ঞপ্তি'), Bell),
      i('profile', L('Profile', 'சுயவிவரம்', 'प्रोफ़ाइल', 'ప్రొఫైల్', 'প্রোফাইল'), User),
    ],
  };
};

/** Locates the active page within the role's navigation, for breadcrumbs and active states. */
export const findNavPosition = (nav, tab) => {
  for (const group of nav.groups) {
    if (group.item?.id === tab) return { group, item: group.item };
    const item = group.items?.find(x => x.id === tab);
    if (item) return { group, item };
  }
  const item = nav.utility.find(x => x.id === tab);
  return item ? { group: undefined, item } : undefined;
};
