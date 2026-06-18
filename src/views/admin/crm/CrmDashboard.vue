<template>
    <v-container fluid class="crm-page">
        <!-- HERO -->
        <section class="hero-card">
            <div>
                <div class="hero-eyebrow">MAVIYA IT SERVICES</div>
                <h1>CRM & Billing Command Center</h1>
                <p>
                    Track demo enquiries, proposals, quotations, invoices, subscriptions
                    and revenue from one place.
                </p>
            </div>

            <div class="hero-actions">
                <v-btn color="white" class="text-primary" prepend-icon="mdi-file-plus" to="/admin/proposals/create">
                    Create Proposal
                </v-btn>

                <v-btn variant="tonal" color="white" prepend-icon="mdi-refresh" :loading="loading"
                    @click="fetchDashboard">
                    Refresh
                </v-btn>
            </div>
        </section>

        <!-- KPI CARDS -->
        <v-row class="dashboard-row">
            <v-col cols="12" sm="6" lg="3" xl="3">
                <div class="kpi-card">
                    <div class="kpi-icon blue">
                        <v-icon>mdi-account-question-outline</v-icon>
                    </div>
                    <div class="kpi-menu">
                        <v-icon size="20">mdi-dots-vertical</v-icon>
                    </div>
                    <p>Demo Enquiries</p>
                    <h2>{{ data.demo_enquiries?.total || 0 }}</h2>
                    <div class="kpi-meta">
                        <span class="text-primary">New: {{ data.demo_enquiries?.new || 0 }}</span>
                        <span>•</span>
                        <span class="text-success">Converted: {{ data.demo_enquiries?.converted || 0 }}</span>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" sm="6" lg="3" xl="2">
                <div class="kpi-card">
                    <div class="kpi-icon green">
                        <v-icon>mdi-file-document-outline</v-icon>
                    </div>
                    <div class="kpi-menu">
                        <v-icon size="20">mdi-dots-vertical</v-icon>
                    </div>
                    <p>Proposals</p>
                    <h2>{{ data.proposals?.total || 0 }}</h2>
                    <div class="kpi-meta">
                        <span class="text-primary">Sent: {{ data.proposals?.sent || 0 }}</span>
                        <span>•</span>
                        <span class="text-success">Approved: {{ data.proposals?.approved || 0 }}</span>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" sm="6" lg="3" xl="2">
                <div class="kpi-card">
                    <div class="kpi-icon purple">
                        <v-icon>mdi-file-percent-outline</v-icon>
                    </div>
                    <div class="kpi-menu">
                        <v-icon size="20">mdi-dots-vertical</v-icon>
                    </div>
                    <p>Quotations</p>
                    <h2>{{ data.quotations?.total || 0 }}</h2>
                    <div class="kpi-meta">
                        <span class="text-primary">Sent: {{ data.quotations?.sent || 0 }}</span>
                        <span>•</span>
                        <span class="text-success">Accepted: {{ data.quotations?.accepted || 0 }}</span>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" sm="6" lg="3" xl="2">
                <div class="kpi-card">
                    <div class="kpi-icon orange">
                        <v-icon>mdi-receipt-text-outline</v-icon>
                    </div>
                    <div class="kpi-menu">
                        <v-icon size="20">mdi-dots-vertical</v-icon>
                    </div>
                    <p>Invoices</p>
                    <h2>{{ data.invoices?.total || 0 }}</h2>
                    <div class="kpi-meta">
                        <span class="text-primary">Paid: {{ data.invoices?.paid || 0 }}</span>
                        <span>•</span>
                        <span class="text-warning">Partial: {{ data.invoices?.partial || 0 }}</span>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" sm="6" lg="3" xl="3">
                <div class="kpi-card">
                    <div class="kpi-icon cyan">
                        <v-icon>mdi-crown-outline</v-icon>
                    </div>
                    <div class="kpi-menu">
                        <v-icon size="20">mdi-dots-vertical</v-icon>
                    </div>
                    <p>Active Subscriptions</p>
                    <h2>{{ data.subscriptions?.active || 0 }}</h2>
                    <div class="kpi-meta">
                        <span class="text-error">
                            Expiring Soon: {{ data.subscriptions?.expiring_soon || 0 }}
                        </span>
                    </div>
                </div>
            </v-col>
        </v-row>

        <v-row class="dashboard-row">
            <v-col cols="12" sm="6" lg="3">
                <div class="value-card blue">
                    <span>Total Pipeline Value</span>
                    <strong>₹{{ money(data.quick_stats?.total_pipeline_value) }}</strong>
                    <small>Proposal + quotation value</small>
                </div>
            </v-col>

            <v-col cols="12" sm="6" lg="3">
                <div class="value-card green">
                    <span>Approved Proposal Value</span>
                    <strong>₹{{ money(data.quick_stats?.approved_proposal_value) }}</strong>
                    <small>Ready for quotation</small>
                </div>
            </v-col>

            <v-col cols="12" sm="6" lg="3">
                <div class="value-card purple">
                    <span>Accepted Quotation Value</span>
                    <strong>₹{{ money(data.quick_stats?.accepted_quotation_value) }}</strong>
                    <small>Ready for invoicing</small>
                </div>
            </v-col>

            <v-col cols="12" sm="6" lg="3">
                <div class="value-card orange">
                    <span>Pending Invoice Value</span>
                    <strong>₹{{ money(data.quick_stats?.pending_invoice_value) }}</strong>
                    <small>Payment follow-up needed</small>
                </div>
            </v-col>
        </v-row>

        <!-- MAIN INFO -->
        <v-row class="dashboard-row">
            <v-col cols="12" lg="4">
                <div class="panel-card">
                    <panel-title icon="mdi-chart-line" title="Revenue Overview" />

                    <div class="revenue-box">
                        <div>
                            <span>Invoiced Amount</span>
                            <strong class="text-primary">₹{{ money(data.revenue?.invoiced) }}</strong>
                        </div>
                        <div>
                            <span>Received Amount</span>
                            <strong class="text-success">₹{{ money(data.revenue?.received) }}</strong>
                        </div>
                        <div>
                            <span>Balance Amount</span>
                            <strong class="text-error">₹{{ money(data.revenue?.balance) }}</strong>
                        </div>
                    </div>

                    <div class="collection-row">
                        <span>Collection Progress</span>
                        <strong>{{ collectionPercentage.toFixed(1) }}%</strong>
                    </div>

                    <v-progress-linear height="9" rounded color="primary" bg-color="blue-lighten-5"
                        :model-value="collectionPercentage" />

                    <div class="month-grid">
                        <div class="month-card">
                            <span>This Month</span>
                            <strong>₹{{ money(data.revenue?.received) }}</strong>
                            <small class="text-success">↗ Current collection</small>
                        </div>

                        <div class="month-card">
                            <span>Pending</span>
                            <strong>₹{{ money(data.revenue?.balance) }}</strong>
                            <small class="text-error">Needs follow-up</small>
                        </div>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" lg="4">
                <div class="panel-card">
                    <panel-title icon="mdi-shield-crown-outline" title="Subscription Summary" />

                    <div class="subscription-layout">
                        <div class="css-donut"></div>

                        <div class="legend-list">
                            <legend-row color="#38c976" label="Active" :value="data.subscriptions?.active || 0" />
                            <legend-row color="#3b82f6" label="Trial" :value="data.subscriptions?.trial || 0" />
                            <legend-row color="#f59e0b" label="Pending Payment"
                                :value="data.subscriptions?.pending_payment || 0" />
                            <legend-row color="#ef4444" label="Expired" :value="data.subscriptions?.expired || 0" />
                            <legend-row color="#94a3b8" label="Cancelled" :value="data.subscriptions?.cancelled || 0" />
                        </div>
                    </div>

                    <div class="info-strip">
                        <v-icon size="18">mdi-information-outline</v-icon>
                        {{ data.subscriptions?.expiring_soon || 0 }} subscriptions are expiring in next 7 days
                    </div>
                </div>
            </v-col>

            <v-col cols="12" lg="4">
                <div class="panel-card">
                    <div class="panel-head">
                        <panel-title icon="mdi-calendar-check-outline" title="Today's Activities" />
                        <v-btn size="small" variant="tonal">View All</v-btn>
                    </div>

                    <div class="activity-list">
                        <activity-item icon="mdi-account-plus-outline" color="red" title="New demo enquiry received"
                            subtitle="Latest enquiry from website" time="Today" />

                        <activity-item icon="mdi-file-check-outline" color="green" title="Proposal activity"
                            subtitle="Approved / sent proposals" :time="`${data.proposals?.approved || 0} approved`" />

                        <activity-item icon="mdi-receipt-text-check-outline" color="green" title="Invoice payments"
                            subtitle="Paid and partial invoices" :time="`${data.invoices?.paid || 0} paid`" />

                        <activity-item icon="mdi-alert-circle-outline" color="orange" title="Subscription follow-up"
                            subtitle="Expiring soon subscriptions"
                            :time="`${data.subscriptions?.expiring_soon || 0} soon`" />
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- LISTS -->
        <v-row class="dashboard-row">
            <v-col cols="12" lg="4">
                <list-card title="Latest Demo Enquiries" view-link="/admin/demo-enquiries"
                    :items="data.demo_enquiries?.latest || []" type="demo" />
            </v-col>

            <v-col cols="12" lg="4">
                <list-card title="Latest Proposals" view-link="/admin/proposals" :items="data.proposals?.latest || []"
                    type="proposal" />
            </v-col>

            <v-col cols="12" lg="4">
                <list-card title="Latest Invoices" view-link="/admin/invoices" :items="data.invoices?.latest || []"
                    type="invoice" />
            </v-col>
        </v-row>

        <!-- QUICK ACTIONS -->
        <div class="panel-card quick-panel">
            <h3>Quick Actions</h3>

            <div class="quick-grid">
                <quick-box icon="mdi-file-plus" title="Create Proposal" to="/admin/proposals/create" color="blue" />
                <quick-box icon="mdi-file-percent-outline" title="Create Quotation" to="/admin/quotations"
                    color="purple" />
                <quick-box icon="mdi-receipt-text-plus-outline" title="Create Invoice" to="/admin/invoices"
                    color="orange" />
                <quick-box icon="mdi-account-plus-outline" title="Add Demo Enquiry" to="/admin/demo-enquiries"
                    color="cyan" />
                <quick-box icon="mdi-account-group-outline" title="Add Customer" to="/admin/demo-enquiries"
                    color="green" />
                <quick-box icon="mdi-chart-box-outline" title="View Reports" to="/admin/reports" color="indigo" />
                <quick-box icon="mdi-file-cog-outline" title="Proposal Templates" to="/admin/proposal-templates"
                    color="indigo" />

                <quick-box icon="mdi-file-plus" title="Create Template" to="/admin/proposal-templates/create"
                    color="blue" />
            </div>
        </div>
    </v-container>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import crmDashboardService from '../../../services/crmDashboardService'
import { useUIStore } from '../../../stores/snackBar'

const ui = useUIStore()

const loading = ref(false)
const data = ref({})

const fetchDashboard = async () => {
    loading.value = true

    try {
        const response = await crmDashboardService.getDashboard()
        data.value = response.data.data || {}
    } catch (error) {
        ui.showSnackbar?.('Failed to load CRM dashboard.', 'error')
        console.error(error)
    } finally {
        loading.value = false
    }
}

const money = (value) => Number(value || 0).toLocaleString('en-IN')

const collectionPercentage = computed(() => {
    const invoiced = Number(data.value.revenue?.invoiced || 0)
    const received = Number(data.value.revenue?.received || 0)

    if (!invoiced) return 0
    return Math.min((received / invoiced) * 100, 100)
})

const PanelTitle = defineComponent({
    props: {
        icon: String,
        title: String,
    },
    setup(props) {
        return () =>
            h('div', { class: 'panel-title' }, [
                h('span', { class: 'panel-title-icon' }, [
                    h('i', { class: `mdi ${props.icon}` }),
                ]),
                h('strong', props.title),
            ])
    },
})

const LegendRow = defineComponent({
    props: {
        color: String,
        label: String,
        value: [String, Number],
    },
    setup(props) {
        return () =>
            h('div', { class: 'legend-row' }, [
                h('span', { class: 'legend-left' }, [
                    h('span', {
                        class: 'legend-dot',
                        style: `background:${props.color}`,
                    }),
                    props.label,
                ]),
                h('strong', props.value),
            ])
    },
})

const ActivityItem = defineComponent({
    props: {
        icon: String,
        color: String,
        title: String,
        subtitle: String,
        time: String,
    },
    setup(props) {
        return () =>
            h('div', { class: 'activity-item' }, [
                h('div', { class: `activity-icon ${props.color}` }, [
                    h('i', { class: `mdi ${props.icon}` }),
                ]),
                h('div', { class: 'activity-content' }, [
                    h('strong', props.title),
                    h('span', props.subtitle),
                ]),
                h('small', props.time),
            ])
    },
})

const QuickBox = defineComponent({
    props: {
        icon: String,
        title: String,
        to: String,
        color: String,
    },
    setup(props) {
        return () =>
            h('a', { class: 'quick-box', href: props.to }, [
                h('span', { class: `quick-icon ${props.color}` }, [
                    h('i', { class: `mdi ${props.icon}` }),
                ]),
                h('strong', props.title),
            ])
    },
})

const ListCard = defineComponent({
    props: {
        title: String,
        viewLink: String,
        items: Array,
        type: String,
    },
    setup(props) {
        const titleFor = (item) => {
            if (props.type === 'proposal') return item.proposal_no || 'Proposal'
            if (props.type === 'invoice') return item.invoice_no || 'Invoice'
            return item.school_name || item.organization_name || item.name || 'Demo Enquiry'
        }

        const subtitleFor = (item) => {
            if (props.type === 'proposal') return item.organization_name || item.client_name || '-'
            if (props.type === 'invoice') return item.organization_name || item.client_name || '-'
            return item.contact_person || item.email || item.mobile || '-'
        }

        const amountFor = (item) => {
            if (props.type === 'proposal' || props.type === 'invoice') {
                return `₹${Number(item.grand_total || 0).toLocaleString('en-IN')}`
            }

            return item.status || 'New'
        }

        const badgeColor = (item) => {
            const status = item.status || ''
            if (['approved', 'paid', 'converted'].includes(status)) return 'success'
            if (['sent', 'contacted'].includes(status)) return 'primary'
            if (['draft', 'pending_payment'].includes(status)) return 'warning'
            if (['rejected', 'expired', 'cancelled'].includes(status)) return 'error'
            return 'info'
        }

        const linkFor = (item) => {
            if (props.type === 'proposal') return `/admin/proposals/${item.id}/edit`
            if (props.type === 'invoice') return `/admin/invoices/${item.id}/edit`
            return props.viewLink
        }

        return () =>
            h('div', { class: 'panel-card list-card' }, [
                h('div', { class: 'list-head' }, [
                    h('h3', props.title),
                    h('a', { href: props.viewLink }, 'View All'),
                ]),

                props.items?.length
                    ? props.items.map((item) =>
                        h('a', { class: 'list-item', href: linkFor(item) }, [
                            h('div', { class: 'avatar' }, titleFor(item).substring(0, 2).toUpperCase()),
                            h('div', { class: 'list-info' }, [
                                h('strong', titleFor(item)),
                                h('span', subtitleFor(item)),
                            ]),
                            h('div', { class: 'list-end' }, [
                                h('strong', amountFor(item)),
                                h('span', { class: `badge ${badgeColor(item)}` }, item.status || 'new'),
                            ]),
                        ])
                    )
                    : h('div', { class: 'empty-list' }, 'No records found.'),
            ])
    },
})

onMounted(fetchDashboard)
</script>

<style scoped>
.crm-page {
    padding: 24px;
    background: #f8fbff;
    min-height: 100%;
}

.dashboard-row {
    margin-top: 22px;
}

.hero-card {
    min-height: 100px;
    padding: 34px;
    border-radius: 22px;
    background:
        radial-gradient(circle at 90% 0%, rgba(255, 255, 255, .18), transparent 26%),
        linear-gradient(135deg, #1368df 0%, #4d3bea 48%, #6d20d8 100%);
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    box-shadow: 0 20px 40px rgba(51, 65, 222, 0.22);
}

.hero-eyebrow {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: .12em;
    margin-bottom: 10px;
}

.hero-card h1 {
    font-size: clamp(20px, 4vw, 40px);
    line-height: 1.05;
    font-weight: 600;
    margin: 0 0 10px;
}

.hero-card p {
    margin: 0;
    opacity: .95;
}

.hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.kpi-card,
.panel-card {
    background: #fff;
    border: 1px solid #e6eef8;
    border-radius: 20px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
}

.kpi-card {
    min-height: 168px;
    padding: 24px;
    position: relative;
}

.kpi-card p {
    margin: 18px 0 6px;
    color: #25314d;
    font-weight: 600;
}

.kpi-card h2 {
    font-size: 34px;
    font-weight: 900;
    margin: 0;
    color: #071326;
}

.kpi-icon {
    width: 58px;
    height: 58px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    font-size: 28px;
}

.kpi-icon.blue {
    background: #eaf2ff;
    color: #1765e8;
}

.kpi-icon.green {
    background: #e8f9ef;
    color: #16a34a;
}

.kpi-icon.purple {
    background: #f2e9ff;
    color: #7c3aed;
}

.kpi-icon.orange {
    background: #fff1df;
    color: #ea7600;
}

.kpi-icon.cyan {
    background: #e9fbff;
    color: #0794aa;
}

.kpi-menu {
    position: absolute;
    top: 20px;
    right: 18px;
    color: #223155;
}

.kpi-meta {
    display: flex;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    margin-top: 18px;
}

.panel-card {
    padding: 24px;
    height: 100%;
}

.panel-head,
.list-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 17px;
    margin-bottom: 22px;
}

.panel-title-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #eaf2ff;
    color: #1765e8;
}

.revenue-box {
    border: 1px solid #e6eef8;
    border-radius: 14px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow: hidden;
}

.revenue-box div {
    padding: 18px 14px;
    border-right: 1px solid #e6eef8;
}

.revenue-box div:last-child {
    border-right: 0;
}

.revenue-box span,
.month-card span {
    display: block;
    color: #5b677f;
    font-size: 12px;
    margin-bottom: 8px;
}

.revenue-box strong {
    font-size: 19px;
}

.collection-row {
    display: flex;
    justify-content: space-between;
    margin: 24px 0 10px;
    font-size: 13px;
}

.month-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-top: 24px;
}

.month-card {
    border: 1px solid #e6eef8;
    border-radius: 14px;
    padding: 18px;
    background: linear-gradient(180deg, #fff, #f8fbff);
}

.month-card strong {
    display: block;
    font-size: 20px;
    margin-bottom: 8px;
    color: #1765e8;
}

.subscription-layout {
    display: grid;
    grid-template-columns: 170px 1fr;
    align-items: center;
    gap: 24px;
}

.css-donut {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: conic-gradient(#38c976 0 58%, #3b82f6 58% 78%, #f59e0b 78% 86%, #ef4444 86% 94%, #94a3b8 94% 100%);
    position: relative;
}

.css-donut::after {
    content: '';
    position: absolute;
    inset: 42px;
    background: #fff;
    border-radius: 50%;
}

.legend-row {
    display: flex;
    justify-content: space-between;
    padding: 9px 0;
    font-size: 14px;
}

.legend-left {
    display: flex;
    gap: 10px;
    align-items: center;
    color: #3f4b65;
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.info-strip {
    margin-top: 22px;
    border-radius: 12px;
    background: #eaf2ff;
    color: #0f4fb8;
    padding: 12px 14px;
    font-size: 13px;
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 600;
}

.activity-list {
    display: grid;
    gap: 2px;
}

.activity-item {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #edf2f7;
}

.activity-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: grid;
    place-items: center;
}

.activity-icon.red {
    background: #ffe8e8;
    color: #ef4444;
}

.activity-icon.green {
    background: #e8f9ef;
    color: #16a34a;
}

.activity-icon.orange {
    background: #fff1df;
    color: #ea7600;
}

.activity-content strong,
.activity-content span {
    display: block;
}

.activity-content span,
.activity-item small {
    color: #5b677f;
    font-size: 13px;
}

.list-card h3,
.quick-panel h3 {
    margin: 0;
    font-size: 18px;
}

.list-head {
    margin-bottom: 14px;
}

.list-head a {
    color: #1765e8;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
}

.list-item {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 14px 0;
    text-decoration: none;
    color: inherit;
    border-bottom: 1px solid #edf2f7;
}

.avatar {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: #eee7ff;
    color: #6d28d9;
    font-weight: 800;
}

.list-info strong,
.list-info span {
    display: block;
}

.list-info span {
    color: #5b677f;
    font-size: 13px;
}

.list-end {
    text-align: right;
}

.list-end strong {
    display: block;
    font-size: 13px;
}

.badge {
    display: inline-block;
    margin-top: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    text-transform: capitalize;
}

.badge.success {
    background: #dcfce7;
    color: #15803d;
}

.badge.primary {
    background: #dbeafe;
    color: #1d4ed8;
}

.badge.warning {
    background: #ffedd5;
    color: #c2410c;
}

.badge.error {
    background: #fee2e2;
    color: #b91c1c;
}

.badge.info {
    background: #e0f2fe;
    color: #0369a1;
}

.empty-list {
    padding: 20px 0;
    color: #6b7280;
}

.quick-panel {
    margin-top: 22px;
}

.quick-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
    margin-top: 20px;
}

.quick-box {
    border: 1px solid #e6eef8;
    border-radius: 14px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: inherit;
    text-decoration: none;
    transition: .2s ease;
}

.quick-box:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 28px rgba(15, 23, 42, .08);
}

.quick-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
}

.value-card {
    border-radius: 20px;
    padding: 22px;
    color: #fff;
    min-height: 135px;
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.value-card span,
.value-card small {
    display: block;
}

.value-card span {
    font-size: 14px;
    opacity: 0.95;
    margin-bottom: 10px;
}

.value-card strong {
    display: block;
    font-size: 26px;
    font-weight: 900;
    margin-bottom: 8px;
}

.value-card small {
    opacity: 0.85;
}

.value-card.blue {
    background: linear-gradient(135deg, #1765e8, #3b82f6);
}

.value-card.green {
    background: linear-gradient(135deg, #16a34a, #4ade80);
}

.value-card.purple {
    background: linear-gradient(135deg, #7c3aed, #a855f7);
}

.value-card.orange {
    background: linear-gradient(135deg, #ea7600, #f59e0b);
}

.quick-icon.blue {
    background: #eaf2ff;
    color: #1765e8;
}

.quick-icon.purple {
    background: #f2e9ff;
    color: #7c3aed;
}

.quick-icon.orange {
    background: #fff1df;
    color: #ea7600;
}

.quick-icon.cyan {
    background: #e9fbff;
    color: #0794aa;
}

.quick-icon.green {
    background: #e8f9ef;
    color: #16a34a;
}

.quick-icon.indigo {
    background: #eef2ff;
    color: #4f46e5;
}

@media (max-width: 1400px) {
    .quick-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 960px) {
    .hero-card {
        flex-direction: column;
        align-items: flex-start;
    }

    .subscription-layout,
    .revenue-box,
    .month-grid {
        grid-template-columns: 1fr;
    }

    .revenue-box div {
        border-right: 0;
        border-bottom: 1px solid #e6eef8;
    }

    .quick-grid {
        grid-template-columns: 1fr;
    }
}
</style>