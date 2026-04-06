from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('issues', '0005_alter_issue_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='issue',
            name='ai_confidence',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='issue',
            name='ai_prediction',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
    ]
