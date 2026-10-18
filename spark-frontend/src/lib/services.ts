/**
 * Service pages: AI & ML, Managed Cloud, Application Development, Digital Growth and
 * their sub-pages. Copy comes from the live sparkcurv.com pages; edit it here, not in
 * the page components (app/(site)/… render whatever is listed).
 */

export type Faq = { q: string; a: string };
/** `logo` is a file in public/images/tools; without one the tool grid shows a neutral icon. */
export type Tool = { name: string; logo?: string };

/** Icons for the sub-service cards (mapped to lucide icons in sections/service/ServiceCards). */
export type ServiceIcon =
  | 'cloud'
  | 'pipeline'
  | 'server'
  | 'container'
  | 'activity'
  | 'database'
  | 'globe'
  | 'phone'
  | 'palette'
  | 'trending'
  | 'users';

export type ServicePage = {
  /** URL segment under the family; '' for the family overview. */
  slug: string;
  path: string;
  /** Short name for the sub-navigation and cards. */
  name: string;
  title: string;
  eyebrow: string;
  description: string;
  /** One-line summary on the family overview's cards. */
  summary: string;
  icon?: ServiceIcon;
  image: string;
  features: string[];
  tools?: Tool[];
  /** Web development lists the industries it builds for (the home page carousel). */
  showIndustries?: boolean;
  faqs: Faq[];
  seo: { title: string; description: string; keywords: string };
};

export type ServiceFamily = {
  key: string;
  path: string;
  name: string;
  overview: ServicePage;
  /** Heading above the sub-service cards on the overview: plain lead + gradient accent. */
  cardsHeading?: { lead: string; accent: string };
  children: ServicePage[];
};

const logo = (file: string) => `/images/tools/${file}`;

/* ------------------------------------------------------------------------------------ */
/* AI & ML                                                                              */
/* ------------------------------------------------------------------------------------ */

const aiMl: ServiceFamily = {
  key: 'ai-ml',
  path: '/ai-ml',
  name: 'AI & ML',
  overview: {
    slug: '',
    path: '/ai-ml',
    name: 'AI & ML',
    title: 'AI & ML services',
    eyebrow: 'Intelligent automation for modern business',
    description:
      'Harness the power of artificial intelligence and machine learning to automate processes, gain predictive insights, and make data-driven decisions that drive growth.',
    summary: 'Machine learning, NLP, computer vision and predictive analytics.',
    image: '/images/services/ai-ml-hero.jpg',
    features: [
      'Machine Learning Model Development',
      'Natural Language Processing',
      'Computer Vision Solutions',
      'Predictive Analytics',
      'AI-Powered Automation',
      'Deep Learning Applications',
    ],
    tools: [
      { name: 'TensorFlow', logo: logo('tensorflow.png') },
      { name: 'PyTorch', logo: logo('pytorch.png') },
      { name: 'Scikit-learn', logo: logo('scikit-learn.svg') },
      { name: 'Keras', logo: logo('keras.svg') },
      { name: 'OpenAI', logo: logo('openai.svg') },
      { name: 'Hugging Face', logo: logo('huggingface.svg') },
      { name: 'Pandas', logo: logo('pandas.svg') },
      { name: 'NumPy', logo: logo('numpy.svg') },
      { name: 'Jupyter', logo: logo('jupyter.svg') },
      { name: 'Python', logo: logo('python.svg') },
      { name: 'NVIDIA', logo: logo('nvidia.png') },
      { name: 'Google Colab', logo: logo('colab.png') },
    ],
    faqs: [
      { q: 'What types of AI & ML solutions do you build?', a: 'We develop a wide range of AI solutions including predictive analytics models, natural language processing systems, computer vision applications, recommendation engines, chatbots, and custom deep learning models tailored to your specific business use case.' },
      { q: 'How long does it take to develop an AI/ML model?', a: 'Timelines vary based on complexity. A proof of concept typically takes 2-4 weeks, while a full production-grade model can take 2-6 months including data preparation, training, testing, and deployment. We follow an iterative approach to deliver results quickly.' },
      { q: 'Do I need a large dataset to get started with AI?', a: 'Not necessarily. While large datasets improve model accuracy, we can work with smaller datasets using techniques like transfer learning, data augmentation, and synthetic data generation. We assess your data readiness as part of our initial consultation.' },
      { q: 'Can you integrate AI into our existing applications?', a: 'Absolutely. We specialize in integrating AI capabilities into existing systems through APIs and microservices. Whether it is adding a recommendation engine to your e-commerce site or NLP to your customer support platform, we ensure seamless integration.' },
      { q: 'What cloud platforms do you use for AI deployment?', a: 'We deploy AI models on all major cloud platforms including AWS (SageMaker), Google Cloud (Vertex AI), and Azure (Azure ML). We also support on-premise and hybrid deployments based on your security and compliance requirements.' },
    ],
    seo: {
      title: 'AI & ML Services | Machine Learning & AI Solutions | SparkCurv',
      description:
        'Transform your business with SparkCurv AI & ML Services. We build machine learning models, NLP solutions, computer vision systems, predictive analytics, and AI-powered automation.',
      keywords: 'AI services, machine learning, NLP, computer vision, predictive analytics',
    },
  },
  children: [],
};

/* ------------------------------------------------------------------------------------ */
/* Managed Cloud Service                                                                */
/* ------------------------------------------------------------------------------------ */

const cloudBase = '/managed-cloud-service';

const managedCloud: ServiceFamily = {
  key: 'managed-cloud-service',
  path: cloudBase,
  name: 'Managed Cloud',
  cardsHeading: { lead: 'Explore our', accent: 'cloud solutions.' },
  overview: {
    slug: '',
    path: cloudBase,
    name: 'Overview',
    title: 'Managed cloud service',
    eyebrow: 'End-to-end cloud & infrastructure management',
    description:
      'We provide comprehensive managed cloud services — from cloud infrastructure and CI/CD automation to containerization, monitoring, and database management. Let us handle your infrastructure so you can focus on building your product.',
    summary: 'Cloud, CI/CD, IaC, containers, monitoring and databases.',
    image: '/images/services/managed-cloud-hero.jpg',
    features: [
      'Cloud Infrastructure Setup & Management',
      'CI/CD Pipeline Automation',
      'Infrastructure as Code with CloudFormation & Terraform',
      'Docker & Kubernetes Containerization',
      '24/7 Cloud & Database Monitoring',
      'Database Administration & Optimization',
      'Disaster Recovery & High Availability',
      'Security & Compliance Management',
    ],
    faqs: [
      { q: 'What does Managed Cloud Service include?', a: 'Our managed cloud service covers the complete infrastructure lifecycle — cloud setup, CI/CD automation, infrastructure as code, containerization with Docker and Kubernetes, 24/7 monitoring, and database management. We handle everything so your team can focus on building products.' },
      { q: 'Which cloud platforms do you support?', a: 'We work with all major cloud providers including AWS, Microsoft Azure, Google Cloud Platform, DigitalOcean, and Linode. We can also manage hybrid and multi-cloud architectures based on your requirements.' },
      { q: 'Do you offer 24/7 infrastructure support?', a: 'Yes, we provide round-the-clock monitoring and support for your cloud infrastructure and databases. Our team proactively detects and resolves issues before they impact your users, with guaranteed SLAs.' },
      { q: 'Can you migrate our existing infrastructure to the cloud?', a: 'Absolutely. We specialize in cloud migration strategies including lift-and-shift, re-platforming, and full re-architecture. We assess your current setup, plan a zero-downtime migration, and optimize your infrastructure post-migration.' },
      { q: 'How do you ensure security and compliance?', a: 'We implement industry best practices including IAM policies, VPC isolation, encryption at rest and in transit, security audits, and compliance with standards like SOC 2, HIPAA, and GDPR. We also set up automated vulnerability scanning and patching.' },
    ],
    seo: {
      title: 'Managed Cloud Services | AWS, Azure, GCP & DevOps Infrastructure Management | SparkCurv',
      description:
        'SparkCurv provides managed cloud services including AWS, Azure, and Google Cloud (GCP) infrastructure management, DevOps automation, CI/CD pipelines, Kubernetes, Docker containerization, monitoring, security, cloud migration, and 24/7 support.',
      keywords:
        'managed cloud services, cloud infrastructure management, AWS cloud services, Azure cloud services, Google Cloud Platform services, DevOps services, CI/CD automation, Kubernetes management, Docker services, cloud migration services, cloud security, cloud monitoring, cloud consulting services',
    },
  },
  children: [
    {
      slug: 'cloud-services',
      path: `${cloudBase}/cloud-services`,
      name: 'Cloud Services',
      title: 'Cloud services',
      eyebrow: 'Scalable cloud infrastructure solutions',
      description:
        "Deploy, manage, and scale your applications on the world's leading cloud platforms. We handle everything from initial setup to ongoing optimization and cost management.",
      summary: 'AWS, Azure, GCP cloud infrastructure setup and management.',
      icon: 'cloud',
      image: '/images/services/cloud-services-hero.jpg',
      features: [
        'Multi-Cloud Strategy & Architecture',
        'Cloud Migration & Modernization',
        'Auto-Scaling & Load Balancing',
        'Cloud Security & IAM Management',
        'Cost Optimization & FinOps',
        'Serverless Architecture',
        'Virtual Private Cloud (VPC) Setup',
        'Cloud Backup & Disaster Recovery',
      ],
      tools: [
        { name: 'AWS', logo: logo('aws.svg') },
        { name: 'Azure', logo: logo('azure.webp') },
        { name: 'Google Cloud', logo: logo('gcp.svg') },
        { name: 'DigitalOcean', logo: logo('digitalocean.svg') },
        { name: 'Linode', logo: logo('linode.webp') },
        { name: 'Terraform', logo: logo('terraform.svg') },
        { name: 'CloudFormation', logo: logo('cloudformation.svg') },
        { name: 'Firebase', logo: logo('firebase.png') },
      ],
      faqs: [
        { q: 'What cloud platforms do you manage?', a: 'We manage infrastructure across AWS, Azure, Google Cloud Platform, DigitalOcean, and Linode. We can also set up and manage multi-cloud or hybrid cloud architectures for redundancy and cost optimization.' },
        { q: 'Can you help reduce our cloud costs?', a: 'Yes, cloud cost optimization is a core part of our service. We analyze your usage patterns, right-size instances, implement auto-scaling, leverage reserved instances and spot pricing, and set up FinOps dashboards for ongoing cost visibility.' },
        { q: 'Do you handle cloud security?', a: 'Absolutely. We implement comprehensive security measures including IAM policies, VPC configuration, security groups, encryption, DDoS protection, and regular security audits. We also ensure compliance with industry standards.' },
        { q: 'What is your approach to cloud migration?', a: 'We follow a phased approach: assessment of your current infrastructure, migration planning with risk analysis, pilot migration, full migration with rollback capability, and post-migration optimization. We ensure zero or minimal downtime throughout.' },
        { q: 'Do you support serverless architectures?', a: 'Yes, we design and deploy serverless solutions using AWS Lambda, Azure Functions, and Google Cloud Functions. Serverless architectures can significantly reduce costs and operational overhead for event-driven workloads.' },
      ],
      seo: {
        title: 'Cloud Services | AWS, Azure & Google Cloud Solutions | DevOps & Infrastructure | SparkCurv',
        description:
          'SparkCurv offers cloud services including AWS, Azure, and Google Cloud Platform (GCP) solutions, DevOps automation, CI/CD pipelines, Kubernetes, Docker, cloud migration, infrastructure management, security, monitoring, and scalable cloud architecture.',
        keywords:
          'cloud services, cloud computing services, AWS services, Azure cloud services, Google Cloud Platform, GCP services, cloud infrastructure, DevOps services, CI/CD pipelines, Kubernetes services, Docker containers, cloud migration, cloud security, cloud architecture, cloud consulting',
      },
    },
    {
      slug: 'cicd-automation',
      path: `${cloudBase}/cicd-automation`,
      name: 'CI/CD Automation',
      title: 'CI/CD automation',
      eyebrow: 'Automated build, test & deploy pipelines',
      description:
        'Accelerate your software delivery with fully automated CI/CD pipelines. We design and implement continuous integration and deployment workflows that ensure code quality, rapid releases, and zero-downtime deployments.',
      summary: 'Automated build, test, and deployment pipelines.',
      icon: 'pipeline',
      image: '/images/services/cicd-hero.jpg',
      features: [
        'CI/CD Pipeline Design & Implementation',
        'Automated Testing Integration',
        'Blue-Green & Canary Deployments',
        'GitOps Workflow Automation',
        'Artifact Management & Versioning',
        'Rollback & Recovery Automation',
        'Multi-Environment Deployment',
        'Pipeline Monitoring & Analytics',
      ],
      tools: [
        { name: 'Jenkins', logo: logo('jenkins.svg') },
        { name: 'GitHub Actions', logo: logo('github-actions.svg') },
        { name: 'GitLab CI', logo: logo('gitlab.svg') },
        { name: 'CircleCI', logo: logo('circleci.svg') },
        { name: 'ArgoCD', logo: logo('argocd.png') },
        { name: 'Bitbucket', logo: logo('bitbucket.webp') },
        { name: 'GitHub', logo: logo('github.png') },
        { name: 'Terraform', logo: logo('terraform.svg') },
        { name: 'Ansible', logo: logo('ansible.webp') },
      ],
      faqs: [
        { q: 'What CI/CD tools do you work with?', a: 'We work with all major CI/CD platforms including Jenkins, GitHub Actions, GitLab CI/CD, CircleCI, ArgoCD, and Bitbucket Pipelines. We recommend the best tool based on your tech stack, team size, and workflow requirements.' },
        { q: 'How do you ensure zero-downtime deployments?', a: 'We implement deployment strategies like blue-green deployments, canary releases, and rolling updates. Combined with automated health checks and instant rollback capabilities, we ensure your users experience no service interruptions during releases.' },
        { q: 'Can you set up CI/CD for our existing project?', a: 'Yes, we can integrate CI/CD pipelines into any existing project regardless of its maturity. We assess your current workflow, identify automation opportunities, and implement pipelines incrementally without disrupting your development process.' },
        { q: 'How do you handle testing in the CI/CD pipeline?', a: 'We integrate automated testing at every stage — unit tests, integration tests, end-to-end tests, security scans, and performance tests. Tests run automatically on every commit, ensuring only quality code reaches production.' },
        { q: 'What is GitOps and do you implement it?', a: 'GitOps is an operational framework where Git is the single source of truth for infrastructure and application deployments. We implement GitOps workflows using tools like ArgoCD and Flux, enabling version-controlled, auditable, and automated deployments.' },
      ],
      seo: {
        title: 'CI/CD Automation Services | DevOps Pipelines & Deployment Automation | SparkCurv',
        description:
          'SparkCurv provides CI/CD automation services including automated build and deployment pipelines, GitOps workflows, testing integration, container deployment, blue-green deployments, and zero-downtime release strategies to accelerate software delivery.',
        keywords:
          'CI/CD automation, continuous integration, continuous deployment, DevOps pipelines, deployment automation, GitOps workflows, Jenkins pipelines, GitHub Actions, GitLab CI, automated testing, blue-green deployment, release automation, DevOps services',
      },
    },
    {
      slug: 'infrastructure-as-code',
      path: `${cloudBase}/infrastructure-as-code`,
      name: 'Infrastructure as Code',
      title: 'Infrastructure as code',
      eyebrow: 'Automate your infrastructure with code',
      description:
        'Define, provision, and manage your entire infrastructure through code. We use industry-leading IaC tools like CloudFormation, Terraform, and Ansible to create reproducible, version-controlled infrastructure that scales effortlessly.',
      summary: 'CloudFormation, Terraform, and Ansible automation.',
      icon: 'server',
      image: '/images/services/iac-hero.jpg',
      features: [
        'Terraform Infrastructure Provisioning',
        'AWS CloudFormation Templates',
        'Ansible Configuration Management',
        'Infrastructure Version Control',
        'Environment Replication & Templating',
        'Compliance as Code',
        'Drift Detection & Remediation',
        'Multi-Cloud IaC Strategy',
      ],
      tools: [
        { name: 'Terraform', logo: logo('terraform.svg') },
        { name: 'CloudFormation', logo: logo('cloudformation.svg') },
        { name: 'Ansible', logo: logo('ansible.webp') },
        { name: 'AWS', logo: logo('aws.svg') },
        { name: 'Google Cloud', logo: logo('gcp.svg') },
        { name: 'Python', logo: logo('python.svg') },
      ],
      faqs: [
        { q: 'What is Infrastructure as Code (IaC)?', a: 'Infrastructure as Code is the practice of managing and provisioning infrastructure through code rather than manual processes. It enables version control, reproducibility, and automation of your entire infrastructure, reducing human error and speeding up deployments.' },
        { q: 'Which IaC tools do you use?', a: 'We primarily use Terraform for multi-cloud provisioning, AWS CloudFormation for AWS-specific infrastructure, and Ansible for configuration management. We select the best combination based on your cloud environment and requirements.' },
        { q: 'Can IaC work with our existing infrastructure?', a: 'Yes, we can import and codify your existing infrastructure into IaC templates. This process involves auditing current resources, writing corresponding code, and gradually transitioning management to the IaC workflow without disrupting running services.' },
        { q: 'How does IaC help with compliance?', a: 'IaC enables "Compliance as Code" where security policies and compliance rules are embedded directly in your infrastructure definitions. Every change is version-controlled, auditable, and reviewed before deployment, ensuring continuous compliance.' },
        { q: 'What is drift detection and why does it matter?', a: 'Drift detection identifies differences between your defined infrastructure code and the actual running infrastructure. It matters because manual changes can introduce security vulnerabilities and inconsistencies. We set up automated drift detection and remediation to keep your infrastructure in sync.' },
      ],
      seo: {
        title: 'Infrastructure as Code Services | Terraform, CloudFormation & Ansible | SparkCurv',
        description:
          'Automate your infrastructure with SparkCurv Infrastructure as Code services. We build version-controlled Terraform, AWS CloudFormation, and Ansible setups with environment templating, compliance as code, and drift detection for repeatable, multi-cloud deployments.',
        keywords:
          'infrastructure as code, IaC services, Terraform consulting, AWS CloudFormation templates, Ansible configuration management, infrastructure automation, compliance as code, drift detection, multi-cloud infrastructure, DevOps automation',
      },
    },
    {
      slug: 'containerization',
      path: `${cloudBase}/containerization`,
      name: 'Containerization',
      title: 'Containerization',
      eyebrow: 'Docker & Kubernetes solutions',
      description:
        'Modernize your applications with containerization. We design and implement container strategies using Docker and Kubernetes to achieve portability, scalability, and efficient resource utilization across any environment.',
      summary: 'Docker, Kubernetes, and orchestration solutions.',
      icon: 'container',
      image: '/images/services/containerization-hero.jpg',
      features: [
        'Docker Container Development',
        'Kubernetes Cluster Management',
        'Microservices Architecture',
        'Container Registry Management',
        'Helm Chart Development',
        'Service Mesh Implementation',
        'Container Security & Scanning',
        'Auto-Scaling & Self-Healing',
      ],
      tools: [
        { name: 'Docker', logo: logo('docker.png') },
        { name: 'Kubernetes', logo: logo('kubernetes.png') },
        { name: 'Helm', logo: logo('helm.svg') },
        { name: 'OpenShift', logo: logo('openshift.svg') },
        { name: 'Terraform', logo: logo('terraform.svg') },
        { name: 'Prometheus', logo: logo('prometheus.webp') },
      ],
      faqs: [
        { q: 'What is containerization and why should we use it?', a: 'Containerization packages your application and its dependencies into isolated, portable containers. It ensures consistent behavior across development, testing, and production environments, reduces infrastructure costs, and enables rapid scaling.' },
        { q: 'What is the difference between Docker and Kubernetes?', a: 'Docker is a platform for creating and running containers, while Kubernetes is an orchestration system that manages multiple containers at scale. Docker builds the containers; Kubernetes deploys, scales, and manages them across clusters of machines.' },
        { q: 'Can you containerize our existing applications?', a: 'Yes, we specialize in containerizing legacy and existing applications. We analyze your application architecture, create optimized Dockerfiles, set up container registries, and implement orchestration — all with minimal changes to your codebase.' },
        { q: 'How do you handle container security?', a: 'We implement multi-layered container security including image vulnerability scanning, runtime security monitoring, network policies, secrets management, and role-based access control. We use tools like Trivy, Falco, and OPA for comprehensive protection.' },
        { q: 'Do you support microservices migration?', a: 'Absolutely. We help decompose monolithic applications into microservices, containerize each service, implement inter-service communication patterns, and deploy them on Kubernetes with proper service mesh, load balancing, and observability.' },
      ],
      seo: {
        title: 'Containerization Services | Docker & Kubernetes Deployment Solutions | SparkCurv',
        description:
          'Deploy scalable applications with SparkCurv Containerization Services. We specialize in Docker, Kubernetes, microservices architecture, container orchestration, and cloud-native application deployment for high performance and reliability.',
        keywords:
          'containerization services, Docker services, Kubernetes deployment, microservices architecture, container orchestration, cloud native applications, DevOps containerization, application deployment, scalable infrastructure, CI/CD containers',
      },
    },
    {
      slug: 'monitoring',
      path: `${cloudBase}/monitoring`,
      name: '24/7 Monitoring',
      title: '24/7 monitoring',
      eyebrow: 'Round-the-clock cloud & database monitoring',
      description:
        'Never miss a critical issue with our 24/7 monitoring services. We provide real-time alerting, performance tracking, and proactive incident response for your cloud infrastructure and databases.',
      summary: 'Round-the-clock cloud and database monitoring.',
      icon: 'activity',
      image: '/images/services/monitoring-hero.jpg',
      features: [
        'Real-Time Infrastructure Monitoring',
        'Database Performance Monitoring',
        'Custom Alert Rules & Escalation',
        'Log Aggregation & Analysis',
        'Uptime & SLA Monitoring',
        'Performance Dashboards & Reporting',
        'Incident Response & Root Cause Analysis',
        'Capacity Planning & Forecasting',
      ],
      tools: [
        { name: 'Prometheus', logo: logo('prometheus.webp') },
        { name: 'Grafana', logo: logo('grafana.svg') },
        { name: 'Datadog', logo: logo('datadog.webp') },
        { name: 'New Relic', logo: logo('newrelic.webp') },
        { name: 'Nagios', logo: logo('nagios.png') },
        { name: 'Zabbix', logo: logo('zabix.webp') },
        // No CloudWatch logo in the repo (the old cloudwatch.png was a saved error page).
        { name: 'AWS CloudWatch' },
        { name: 'Elasticsearch', logo: logo('elasticsearch.png') },
        { name: 'Wazuh', logo: logo('wazuh.webp') },
      ],
      faqs: [
        { q: 'What do you monitor in a 24/7 monitoring service?', a: 'We monitor server health, CPU/memory/disk usage, network traffic, application performance, database queries, API response times, error rates, and uptime. We also track business-critical metrics customized to your application.' },
        { q: 'What monitoring tools do you use?', a: 'We use industry-standard tools including Prometheus, Grafana, Datadog, New Relic, Nagios, Zabbix, and AWS CloudWatch. We select the best combination based on your infrastructure and create custom dashboards for real-time visibility.' },
        { q: 'How quickly do you respond to incidents?', a: 'Our response times depend on severity — critical incidents (P1) are acknowledged within 5 minutes and resolved within 1 hour. We provide automated alerting, escalation procedures, and post-incident root cause analysis for every significant event.' },
        { q: 'Can you monitor both cloud and on-premise infrastructure?', a: 'Yes, we support hybrid monitoring setups covering cloud resources, on-premise servers, containers, databases, and applications. We create unified dashboards that give you a single view across your entire infrastructure.' },
        { q: 'Do you provide monitoring reports and analytics?', a: 'Absolutely. We provide weekly and monthly reports covering uptime statistics, performance trends, incident summaries, capacity forecasts, and optimization recommendations. All reports are accessible through real-time dashboards as well.' },
      ],
      seo: {
        title: 'Cloud Monitoring & Observability Services | 24/7 Infrastructure Monitoring | SparkCurv',
        description:
          'Ensure system reliability with SparkCurv Cloud Monitoring Services. We provide 24/7 infrastructure monitoring, application performance monitoring (APM), logging, alerting, and observability solutions for AWS, Azure, and GCP environments.',
        keywords:
          'cloud monitoring services, infrastructure monitoring, application performance monitoring, APM tools, DevOps monitoring, observability solutions, cloud logging, system alerting, AWS monitoring, Azure monitoring, GCP monitoring',
      },
    },
    {
      slug: 'database-management',
      path: `${cloudBase}/database-management`,
      name: 'Database Management',
      title: 'Database management',
      eyebrow: 'Reliable, scalable & secure data solutions',
      description:
        'Ensure your data is always available, secure, and performing at its best. We provide end-to-end database management including design, optimization, migration, monitoring, and disaster recovery.',
      summary: 'MySQL, PostgreSQL, MongoDB administration.',
      icon: 'database',
      image: '/images/platforms/database-hero.jpg',
      features: [
        'Database Design & Architecture',
        'Performance Tuning & Query Optimization',
        'Database Migration & Upgrades',
        '24/7 Database Monitoring & Alerts',
        'Backup & Disaster Recovery',
        'High Availability & Replication',
        'Security Audits & Compliance',
        'Cloud Database Management (AWS RDS, Azure SQL)',
      ],
      tools: [
        { name: 'MySQL', logo: logo('mysql.png') },
        { name: 'PostgreSQL', logo: logo('postgresql.webp') },
        { name: 'MongoDB', logo: logo('mongodb.webp') },
        { name: 'Redis', logo: logo('redis.webp') },
        { name: 'Oracle', logo: logo('oracle.png') },
        { name: 'MariaDB', logo: logo('mariadb.webp') },
        { name: 'SQLite', logo: logo('sqlite.webp') },
        { name: 'Cassandra', logo: logo('cassandra.webp') },
        { name: 'Elasticsearch', logo: logo('elasticsearch.png') },
        { name: 'DynamoDB', logo: logo('dynamodb.webp') },
      ],
      faqs: [
        { q: 'Which databases do you support?', a: 'We support all major relational and NoSQL databases including MySQL, PostgreSQL, MongoDB, Redis, Oracle, MariaDB, Cassandra, Elasticsearch, DynamoDB, and SQLite. We also manage cloud-native databases like AWS RDS and Azure SQL.' },
        { q: 'What does database performance tuning involve?', a: 'Performance tuning includes query optimization, index analysis, schema redesign, connection pooling, caching strategies, and resource allocation. We analyze slow queries, identify bottlenecks, and implement changes that can improve performance by 10-100x.' },
        { q: 'How do you handle database backups and disaster recovery?', a: 'We implement automated backup schedules with point-in-time recovery, cross-region replication, and regular disaster recovery drills. We ensure RPO (Recovery Point Objective) and RTO (Recovery Time Objective) meet your business continuity requirements.' },
        { q: 'Can you migrate our database to the cloud?', a: 'Yes, we specialize in database migrations — from on-premise to cloud, between cloud providers, or across database engines. We plan migrations with minimal downtime using tools like AWS DMS, and validate data integrity post-migration.' },
        { q: 'Do you offer high availability database setups?', a: 'Absolutely. We configure master-replica setups, multi-AZ deployments, automatic failover, and read replicas for load distribution. Our HA configurations ensure 99.99% uptime with automated health checks and self-healing capabilities.' },
      ],
      seo: {
        title: 'Database Management Services | MySQL, PostgreSQL, MongoDB Optimization | SparkCurv',
        description:
          'Optimize and secure your data with SparkCurv Database Management Services. We provide database design, migration, performance tuning, backup, recovery, monitoring, and scaling for MySQL, PostgreSQL, MongoDB, and cloud databases.',
        keywords:
          'database management services, database optimization, MySQL management, PostgreSQL services, MongoDB database, database migration, database performance tuning, database backup and recovery, cloud database management, DBA services',
      },
    },
  ],
};

/* ------------------------------------------------------------------------------------ */
/* Application Development                                                              */
/* ------------------------------------------------------------------------------------ */

const appBase = '/application-development';

const appDev: ServiceFamily = {
  key: 'application-development',
  path: appBase,
  name: 'Application Development',
  cardsHeading: { lead: 'Build your', accent: 'digital product.' },
  overview: {
    slug: '',
    path: appBase,
    name: 'Overview',
    title: 'Application development',
    eyebrow: 'Web & mobile solutions for every business',
    description:
      'We build high-performance web and mobile applications tailored to your business needs. From e-commerce platforms to enterprise mobile apps, our team delivers solutions that drive engagement and revenue.',
    summary: 'Web platforms and native or cross-platform mobile apps.',
    image: '/images/services/app-dev-hero.jpg',
    features: [
      'Custom Web Application Development',
      'Mobile App Development (iOS & Android)',
      'E-commerce & Marketplace Solutions',
      'Progressive Web Apps (PWA)',
      'Cross-Platform Mobile Development',
      'UI/UX Design & Prototyping',
      'API Development & Integration',
      'Maintenance & Support',
    ],
    faqs: [
      { q: 'What types of applications do you develop?', a: 'We develop custom web applications, mobile apps (iOS & Android), progressive web apps, e-commerce platforms, enterprise portals, SaaS products, and cross-platform solutions. Each project is tailored to your specific business requirements and target audience.' },
      { q: 'How long does it take to develop an application?', a: 'Development timelines depend on complexity. A simple web app takes 4-8 weeks, a medium-complexity app 2-4 months, and enterprise-grade applications 4-8 months. We provide a detailed timeline during the planning phase after understanding your requirements.' },
      { q: 'Do you offer UI/UX design services?', a: 'Yes, UI/UX design is an integral part of our development process. We create wireframes, prototypes, and high-fidelity designs using Figma before development begins. Our designs focus on user experience, accessibility, and conversion optimization.' },
      { q: 'What technologies do you use for development?', a: 'We use modern technology stacks including React, Angular, Vue.js, Next.js for web; React Native and Flutter for mobile; Node.js, Python, Laravel, and PHP for backend. We choose the best stack based on your project requirements, scalability needs, and budget.' },
      { q: 'Do you provide post-launch support and maintenance?', a: 'Absolutely. We offer ongoing maintenance packages that include bug fixes, performance monitoring, security updates, feature enhancements, and technical support. We ensure your application stays up-to-date and performs optimally after launch.' },
    ],
    seo: {
      title: 'Application Development Services | Web & Mobile App Development | SparkCurv',
      description:
        'SparkCurv delivers custom web and mobile application development services, including web apps, iOS and Android apps, e-commerce solutions, PWAs, API integration, UI/UX design, and ongoing support to help businesses grow.',
      keywords:
        'application development services, app development services, custom application development, web application development, mobile application development, software development company, business application development, enterprise application development, UI UX design services, app development company',
    },
  },
  children: [
    {
      slug: 'web-development',
      path: `${appBase}/web-development`,
      name: 'Web Development',
      title: 'Website development',
      eyebrow: 'Custom web solutions for every industry',
      description:
        'We design and develop high-performance, scalable websites tailored to your business needs. From e-commerce platforms to enterprise portals, we build web experiences that convert visitors into customers.',
      summary: 'Custom websites, web apps, e-commerce platforms for every industry.',
      icon: 'globe',
      image: '/images/platforms/webdev-hero.jpg',
      features: [
        'Custom Website Design & Development',
        'E-commerce Website Development',
        'Progressive Web Apps (PWA)',
        'CMS Development (WordPress, Custom)',
        'Responsive & Mobile-First Design',
        'API Integration & Backend Development',
        'Website Maintenance & Support',
        'Performance Optimization & SEO',
      ],
      tools: [
        { name: 'React', logo: logo('react.webp') },
        { name: 'Angular', logo: logo('angular.webp') },
        { name: 'Vue.js', logo: logo('vuejs.svg') },
        { name: 'Next.js', logo: logo('nextjs.webp') },
        { name: 'WordPress', logo: logo('wordpress.svg') },
        { name: 'Laravel', logo: logo('laravel.svg') },
        { name: 'Node.js', logo: logo('nodejs.webp') },
        { name: 'PHP', logo: logo('php.webp') },
        { name: 'Python', logo: logo('python.svg') },
        { name: 'Tailwind CSS', logo: logo('tailwindcss.png') },
        { name: 'Bootstrap', logo: logo('bootstrap.webp') },
      ],
      showIndustries: true,
      faqs: [
        { q: 'What types of websites do you build?', a: 'We build all types of websites including corporate websites, e-commerce stores, SaaS platforms, CMS-based sites, portfolio websites, landing pages, progressive web apps, and custom web applications. Each project is designed to meet your specific business goals.' },
        { q: 'Do you build responsive websites?', a: 'Yes, every website we build is fully responsive and mobile-first. Our designs adapt seamlessly across all devices — desktops, tablets, and smartphones — ensuring a consistent user experience regardless of screen size.' },
        { q: 'Can you build an e-commerce website?', a: 'Absolutely. We develop full-featured e-commerce platforms with product catalogs, shopping carts, secure payment gateways, inventory management, order tracking, and analytics. We work with platforms like Shopify, WooCommerce, and custom-built solutions.' },
        { q: 'Do you offer SEO-friendly web development?', a: 'Yes, SEO is built into our development process from the start. We implement clean code structure, semantic HTML, optimized page speed, meta tags, schema markup, sitemap generation, and mobile optimization — all essential for strong search engine rankings.' },
        { q: 'How much does a website cost?', a: 'Website costs vary based on complexity, features, and design requirements. A basic website starts from a few hundred dollars, while complex web applications can range into thousands. We provide detailed quotes after understanding your specific requirements during the initial consultation.' },
      ],
      seo: {
        title: 'Website Development Services | Custom Web Solutions for Every Industry | SparkCurv',
        description:
          'SparkCurv provides custom website development services, including e-commerce websites, PWAs, CMS development, API integrations, responsive design, and SEO optimization. We build scalable, high-performance web solutions for businesses across all industries.',
        keywords:
          'website development services, web development company, custom website development, web design services, responsive website design, e-commerce website development, business website development, CMS development, progressive web apps, SEO-friendly websites, React development, Node.js development',
      },
    },
    {
      slug: 'mobile-app',
      path: `${appBase}/mobile-app`,
      name: 'Mobile App',
      title: 'Mobile app development',
      eyebrow: 'Native & cross-platform mobile solutions',
      description:
        'Build stunning, high-performance mobile applications for iOS and Android. We create user-centric apps that deliver exceptional experiences and drive engagement.',
      summary: 'Native & cross-platform mobile apps for iOS and Android.',
      icon: 'phone',
      image: '/images/services/mobile-app-hero.jpg',
      features: [
        'iOS App Development',
        'Android App Development',
        'React Native / Flutter',
        'UI/UX Design',
        'App Store Optimization',
        'Maintenance & Support',
        'Push Notifications & Analytics',
        'Third-Party API Integration',
      ],
      tools: [
        { name: 'React Native', logo: logo('react-native.svg') },
        { name: 'Flutter', logo: logo('flutter.png') },
        { name: 'Swift', logo: logo('swift.png') },
        { name: 'Kotlin', logo: logo('kotlin.webp') },
        { name: 'Android Studio', logo: logo('android-studio.svg') },
        { name: 'Xcode', logo: logo('xcode.png') },
        { name: 'Firebase', logo: logo('firebase.png') },
        { name: 'Expo', logo: logo('expo.png') },
        { name: 'Figma', logo: logo('figma.webp') },
        { name: 'TestFlight', logo: logo('testflight.png') },
      ],
      faqs: [
        { q: 'Do you build apps for both iOS and Android?', a: 'Yes, we develop for both platforms. We offer native development (Swift for iOS, Kotlin for Android) for maximum performance, and cross-platform development (React Native, Flutter) for faster delivery and cost efficiency with a single codebase.' },
        { q: 'How long does it take to build a mobile app?', a: 'A simple app takes 6-10 weeks, a moderately complex app 3-5 months, and a feature-rich enterprise app 5-8 months. We follow an agile approach and deliver working builds every 2 weeks so you can see progress early and provide feedback.' },
        { q: 'Will you help publish the app on App Store and Google Play?', a: 'Yes, we handle the entire publishing process including app store optimization (ASO), screenshot creation, description writing, compliance review, and submission to both Apple App Store and Google Play Store.' },
        { q: 'Do you provide app maintenance after launch?', a: 'Absolutely. We offer post-launch support including bug fixes, OS compatibility updates, performance monitoring, feature enhancements, and analytics tracking. We ensure your app stays compatible with the latest iOS and Android versions.' },
        { q: 'Can you integrate third-party services into the app?', a: 'Yes, we integrate a wide range of third-party services including payment gateways (Stripe, Razorpay), push notifications (Firebase), analytics (Mixpanel, Amplitude), maps (Google Maps), social media, and any service with a REST or GraphQL API.' },
      ],
      seo: {
        title: 'Mobile App Development Services | iOS & Android App Development | SparkCurv',
        description:
          'Build high-performance iOS and Android mobile apps with SparkCurv. We provide mobile app development services including Flutter, React Native, UI/UX design, API integration, app store publishing, maintenance, and ongoing support.',
        keywords:
          'mobile app development services, app development company, iOS app development, Android app development, Flutter development, React Native development, custom mobile app development, cross-platform app development, mobile application development company, UI UX design services',
      },
    },
  ],
};

/* ------------------------------------------------------------------------------------ */
/* Digital Growth & Outsourcing                                                         */
/* ------------------------------------------------------------------------------------ */

const growthBase = '/digital-growth';

const digitalGrowth: ServiceFamily = {
  key: 'digital-growth',
  path: growthBase,
  name: 'Digital Growth',
  cardsHeading: { lead: 'Grow your', accent: 'business.' },
  overview: {
    slug: '',
    path: growthBase,
    name: 'Overview',
    title: 'Digital growth & outsourcing',
    eyebrow: 'Branding, marketing & team scaling',
    description:
      'We help businesses grow through powerful branding, data-driven digital marketing, and scalable outsourcing solutions. From brand identity to lead generation to dedicated development teams — we cover it all.',
    summary: 'Branding, digital marketing and dedicated teams.',
    image: '/images/services/digital-growth-hero.jpg',
    features: [
      'Brand Identity Design & Strategy',
      'Search Engine Optimization (SEO)',
      'Social Media Marketing & Management',
      'Pay-Per-Click Advertising (PPC)',
      'Dedicated Development Teams',
      'Staff Augmentation & Project Outsourcing',
      'Content Marketing & Email Campaigns',
      'Analytics, Reporting & Growth Strategy',
    ],
    faqs: [
      { q: 'What services fall under Digital Growth & Outsourcing?', a: 'This category covers three core services: Branding (logo design, brand identity, visual design), Digital Marketing (SEO, PPC, social media, content marketing), and IT Outsourcing (dedicated teams, staff augmentation, project-based outsourcing).' },
      { q: 'Can I use individual services or do I need the full package?', a: 'You can choose individual services or combine them for maximum impact. Many clients start with branding, then add digital marketing to drive growth, and use outsourcing to scale their development capacity as the business grows.' },
      { q: 'How do you measure the success of your services?', a: 'We set clear KPIs for each service — brand awareness metrics for branding, traffic/leads/conversion rates for digital marketing, and delivery velocity/quality metrics for outsourcing. We provide regular reports and dashboards for full transparency.' },
      { q: 'Do you work with businesses outside India?', a: 'Yes, we serve clients globally. Our digital marketing and outsourcing services are fully remote-friendly. We work across time zones and provide flexible engagement models that suit international collaboration.' },
      { q: 'How do I get started?', a: 'Simply contact us through our website or WhatsApp. We will schedule a free consultation to understand your needs, propose a tailored strategy, and provide a detailed quote. Most projects kick off within 1-2 weeks of agreement.' },
    ],
    seo: {
      title: 'Digital Growth & Outsourcing | Branding, Digital Marketing & Dedicated Teams | SparkCurv',
      description:
        'Grow your business with SparkCurv: brand identity design, data-driven digital marketing (SEO, PPC, social media, content), and IT outsourcing with dedicated development teams and staff augmentation.',
      keywords:
        'digital growth services, branding agency, digital marketing services, SEO services, PPC advertising, social media marketing, IT outsourcing, dedicated development teams, staff augmentation, growth strategy',
    },
  },
  children: [
    {
      slug: 'branding',
      path: `${growthBase}/branding`,
      name: 'Branding',
      title: 'Branding',
      eyebrow: 'Build a powerful brand identity',
      description:
        'Create a lasting impression with professional branding. We design logos, brand guidelines, marketing materials, and visual identities that resonate with your audience and set you apart from the competition.',
      summary: 'Logo design, brand identity, visual design & creative strategy.',
      icon: 'palette',
      image: '/images/services/branding-hero.jpg',
      features: [
        'Logo Design & Brand Mark',
        'Brand Strategy & Positioning',
        'Visual Identity & Style Guide',
        'Marketing Collateral Design',
        'Social Media Branding',
        'Packaging Design',
        'Motion Graphics & Animations',
        'Brand Audit & Refresh',
      ],
      tools: [
        { name: 'Photoshop', logo: logo('photoshop.svg') },
        { name: 'Illustrator', logo: logo('illustrator.svg') },
        { name: 'After Effects', logo: logo('after-effects.svg') },
        { name: 'Premiere Pro', logo: logo('premiere-pro.svg') },
        { name: 'Figma', logo: logo('figma.webp') },
        { name: 'InVision', logo: logo('invision.svg') },
      ],
      faqs: [
        { q: 'What does your branding service include?', a: 'Our branding service covers logo design, brand strategy, visual identity creation, style guides, marketing collateral, social media branding, packaging design, and motion graphics. We create a complete brand identity that resonates with your target audience.' },
        { q: 'How long does a branding project take?', a: 'A typical branding project takes 2-4 weeks depending on scope. Logo design alone takes about 1-2 weeks with multiple concept rounds, while a complete brand identity package including style guide and collateral takes 3-6 weeks.' },
        { q: 'Do you offer brand refresh or rebranding services?', a: 'Yes, we provide brand audits to assess your current positioning, and then execute refreshes or complete rebrands. Whether you need a modern update to your logo or a full strategic repositioning, we guide you through the entire process.' },
        { q: 'How many design concepts will I receive?', a: 'For logo design, we typically present 3-5 initial concepts based on your brief. You can choose your favorite direction and we refine it through 2-3 revision rounds until you are completely satisfied with the final design.' },
        { q: 'Will I own the final brand assets?', a: 'Absolutely. Upon project completion and final payment, you receive full ownership of all brand assets including source files (AI, PSD, EPS), web-ready files (SVG, PNG), and the complete brand style guide. All intellectual property rights are transferred to you.' },
      ],
      seo: {
        title: 'Branding Agency | Logo Design, Brand Identity & Strategy | SparkCurv',
        description:
          "Build a strong and memorable brand with SparkCurv's professional branding services. We offer logo design, brand identity, brand strategy, visual identity, marketing materials, social media branding, and packaging design.",
        keywords:
          'branding agency, logo design services, brand identity design, brand strategy, visual identity, corporate branding, social media branding, packaging design, brand consulting, creative branding agency',
      },
    },
    {
      slug: 'digital-marketing',
      path: `${growthBase}/digital-marketing`,
      name: 'Digital Marketing',
      title: 'Digital marketing',
      eyebrow: 'Data-driven growth strategies',
      description:
        'Grow your brand with strategic digital marketing campaigns. We leverage SEO, content marketing, social media, and analytics to drive measurable results.',
      summary: 'SEO, content marketing, social media, PPC & analytics.',
      icon: 'trending',
      image: '/images/services/digital-marketing-hero.jpg',
      features: [
        'Search Engine Optimization (SEO)',
        'Content Marketing Strategy',
        'Social Media Management',
        'Pay-Per-Click Advertising',
        'Email Marketing Campaigns',
        'Analytics & Reporting',
        'Conversion Rate Optimization',
        'Influencer Marketing',
      ],
      tools: [
        { name: 'Google Analytics', logo: logo('google-analytics.svg') },
        { name: 'Google Ads', logo: logo('google-ads.png') },
        { name: 'Meta Ads', logo: logo('meta.svg') },
        { name: 'Mailchimp', logo: logo('mailchimp.webp') },
        { name: 'HubSpot', logo: logo('hubspot.svg') },
        { name: 'Semrush', logo: logo('semrush.png') },
        { name: 'Ahrefs', logo: logo('ahrefs.webp') },
        { name: 'Buffer', logo: logo('buffer.webp') },
        { name: 'LinkedIn Ads', logo: logo('linkedin.png') },
      ],
      faqs: [
        { q: 'What digital marketing services do you offer?', a: 'We offer SEO (on-page, off-page, technical), content marketing, social media marketing, pay-per-click advertising (Google Ads, Meta Ads), email marketing, conversion rate optimization, influencer marketing, and analytics/reporting.' },
        { q: 'How soon can I see results from digital marketing?', a: 'PPC campaigns can generate leads within days of launch. SEO typically shows significant results in 3-6 months. Social media engagement improves within the first month. We set realistic expectations and provide monthly progress reports with measurable KPIs.' },
        { q: 'Do you manage social media accounts?', a: 'Yes, we provide full social media management including content strategy, post creation, scheduling, community management, engagement tracking, and paid campaign management across platforms like Instagram, Facebook, LinkedIn, Twitter, and YouTube.' },
        { q: 'How do you measure marketing ROI?', a: 'We track key metrics including website traffic, lead generation, conversion rates, cost per acquisition, return on ad spend (ROAS), and revenue attribution. We set up Google Analytics, conversion tracking, and custom dashboards so you can see ROI in real-time.' },
        { q: 'Can you work with our existing marketing team?', a: 'Absolutely. We frequently collaborate with in-house marketing teams, acting as an extension of your department. We can handle specific channels (like SEO or PPC) while your team manages others, or provide strategic guidance across all channels.' },
      ],
      seo: {
        title: 'Digital Marketing Services | SEO, Social Media & PPC Experts | SparkCurv',
        description:
          "Grow your business with SparkCurv's digital marketing services. We specialize in SEO, content marketing, social media management, PPC advertising, email marketing, and analytics-driven strategies that deliver measurable results.",
        keywords:
          'digital marketing services, SEO services, social media marketing, PPC advertising, content marketing, email marketing, search engine optimization, social media management, Google Ads services, digital marketing agency',
      },
    },
    {
      slug: 'outsourcing',
      path: `${growthBase}/outsourcing`,
      name: 'Outsourcing',
      title: 'IT outsourcing',
      eyebrow: 'Scale your team with expert talent',
      description:
        'Access a global pool of skilled developers and tech professionals. We provide dedicated teams that integrate seamlessly with your workflow to accelerate project delivery.',
      summary: 'Dedicated teams, staff augmentation & project-based outsourcing.',
      icon: 'users',
      image: '/images/services/outsourcing-hero.jpg',
      features: [
        'Dedicated Development Teams',
        'Staff Augmentation',
        'Project-Based Outsourcing',
        'Quality Assurance & Testing',
        'Agile Methodologies',
        'Transparent Communication',
        'Flexible Engagement Models',
        'IP Protection & NDA Compliance',
      ],
      tools: [
        { name: 'Slack', logo: logo('slack.svg') },
        { name: 'Jira', logo: logo('jira.svg') },
        { name: 'GitHub', logo: logo('github.png') },
        { name: 'Trello', logo: logo('trello.svg') },
        { name: 'Asana', logo: logo('asana.svg') },
        { name: 'Notion', logo: logo('notion.png') },
        { name: 'Confluence', logo: logo('confluence.svg') },
        { name: 'Miro', logo: logo('miro.svg') },
        { name: 'ClickUp', logo: logo('clickup.svg') },
      ],
      faqs: [
        { q: 'What outsourcing models do you offer?', a: 'We offer three engagement models: Dedicated Teams (full-time developers working exclusively on your project), Staff Augmentation (individual experts integrated into your existing team), and Project-Based Outsourcing (complete project delivery with defined scope and timeline).' },
        { q: 'How do you ensure quality in outsourced projects?', a: 'We follow rigorous quality processes including code reviews, automated testing, CI/CD pipelines, sprint demos, and regular client check-ins. Every team member is vetted and trained in our quality standards. We also provide dedicated project managers for oversight.' },
        { q: 'What time zones do your teams work in?', a: 'Our primary team is based in India (IST), but we offer flexible working hours to overlap with US, European, and APAC time zones. For dedicated teams, we can arrange shifts that fully align with your business hours for real-time collaboration.' },
        { q: 'How do you protect our intellectual property?', a: 'All team members sign strict NDAs and IP assignment agreements before joining your project. We use secure development environments, access controls, and encrypted communication channels. Full IP ownership transfers to you as per our standard contract terms.' },
        { q: 'How quickly can you set up a dedicated team?', a: 'We can typically assemble a dedicated team within 1-2 weeks depending on the skill requirements. For common tech stacks (React, Node.js, Python, Java), we often have pre-vetted developers ready to start immediately.' },
      ],
      seo: {
        title: 'IT Outsourcing Services | Dedicated Development Teams & Staff Augmentation | SparkCurv',
        description:
          "Scale your business with SparkCurv's IT outsourcing services. We provide dedicated development teams, staff augmentation, project-based outsourcing, quality assurance, and agile delivery to accelerate your development process.",
        keywords:
          'IT outsourcing services, dedicated development teams, staff augmentation services, offshore development team, remote developers, software outsourcing company, IT staff augmentation, project outsourcing, hire dedicated developers, technology outsourcing',
      },
    },
  ],
};

export const families = { aiMl, managedCloud, appDev, digitalGrowth };

/** Looks up a sub-page by slug; undefined for an unknown slug. */
export function findChild(family: ServiceFamily, slug: string) {
  return family.children.find((c) => c.slug === slug);
}
