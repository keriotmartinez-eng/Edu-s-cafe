from django.contrib import admin
from .models import Lead, Interaccion


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "correo",
        "telefono",
        "interes",
        "fuente",
        "estado",
        "asignado_a",
        "creado_en",
    )

    list_filter = (
        "estado",
        "fuente",
        "creado_en",
    )

    search_fields = (
        "nombre",
        "correo",
    )

    readonly_fields = (
        "creado_en",
        "actualizado_en",
    )

    ordering = ("-creado_en",)


@admin.register(Interaccion)
class InteraccionAdmin(admin.ModelAdmin):
    list_display = (
        "lead",
        "tipo",
        "nota",
        "fecha",
        "registrado_por",
    )

    list_filter = (
        "tipo",
        "fecha",
    )

    search_fields = (
        "lead__nombre",
        "lead__correo",
        "nota",
    )

    ordering = ("-fecha",)