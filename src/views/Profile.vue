<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import api from "../plugins/api";
import { useAuthStore } from "../stores/auth";

const user = useAuthStore();
const loading = ref(false);

const form = ref({
  name: "",
  email: "",
  contact: "",
  address: "",
  profile: null,
});



const fetchUser = async () => {
  const res = await api.get("/current-user");
  user.value = res.data;
    
  console.log('User Data', res.data);
    console.log(user.value.name);
  form.value.name = user.value.name;
  form.value.email = user.value.email;
  form.value.contact = user.value.contact;
  form.value.address = user.value.address;
};

const preview = ref(user.value.profile ? user.value.profile : null);

const onFileChange = (e) => {
  const file = e.target.files[0];
  form.value.profile = file;
  preview.value = URL.createObjectURL(file);
};

const updateProfile = async () => {
  loading.value = true;

  const data = new FormData();
  data.append("name", form.value.name);
  data.append("email", form.value.email);
  data.append("contact", form.value.contact);
  data.append("address", form.value.address);

  if (form.value.profile) {
    data.append("profile", form.value.profile);
  }

  await api.post("/profile", data);

  await fetchUser();

  loading.value = false;
};
await fetchUser();
onBeforeMount(fetchUser);
</script>

<template>
  <v-container fluid class="fill-height d-flex align-center justify-center">
    <v-row justify="center">
      <v-col cols="12" md="3">
        <v-card class="pa-6 text-center rounded-xl">
          <v-avatar size="100" class="mb-3">
            <v-img v-if="preview" :src="preview" />
            <v-img v-else-if="user.value.profile" :src="user.value.profile" />
            <span v-else>{{ user.value.name.charAt(0) }}</span>
          </v-avatar>

          <div class="text-h6 font-weight-bold">
            {{ user.value.name }}
          </div>

          <div class="text-caption text-grey">
            {{ user.value.role }}
          </div>

          <v-divider class="my-3" />

          <div class="text-body-2">
            {{ user.value.email }}
          </div>
          <div class="text-body-2">
            {{ user.value.contact }}
          </div>
          <div class="text-body-2">
            {{ user.value.address }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card class="pa-5" rounded-xl>
          <h3 class="mb-4">Edit Profile</h3>

          <v-text-field
            v-model="form.name"
            label="Name"
            class="mt-3"
            prepend-icon="mdi-account"
          />
          <v-text-field
            v-model="form.email"
            label="Email"
            prepend-icon="mdi-email"
          />
          <v-text-field
            v-model="form.contact"
            label="Contact"
            prepend-icon="mdi-phone"
          />
          <v-text-field
            v-model="form.address"
            label="Address"
            prepend-icon="mdi-map-marker"
          />

           <!-- Avatar Preview -->
          <v-avatar size="100" class="mb-3">
            <v-img v-if="preview" :src="preview" />
            <v-img v-else-if="user.profile" :src="'/storage/' + user.profile" />
            <span v-else>{{ user.name?.charAt(0) }}</span>
          </v-avatar>
         

          <input type="file" @change="onFileChange" />

          <v-btn color="primary" :loading="loading" @click="updateProfile">
            Update Profile
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
